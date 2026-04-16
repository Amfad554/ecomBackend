const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Add to cart
exports.addToCart = async (req, res) => {
    const { userid, guestId, productid, color, size, quantity } = req.body;
    const parsedProductid = parseInt(productid);

    try {
        const cartWhere = userid
            ? { userid: parseInt(userid) }
            : { guestId: guestId };

        const existingCart = await prisma.cart.upsert({
            where: cartWhere,
            update: {},
            create: cartWhere,
        });

        const existingItem = await prisma.productCart.findFirst({
            where: {
                cartid: existingCart.id,
                productid: parsedProductid,
                selectedcolor: color || null,
                selectedsize: size || null,
            },
        });

        if (existingItem) {
            await prisma.productCart.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + (quantity || 1) },
            });
        } else {
            await prisma.productCart.create({
                data: {
                    cartid: existingCart.id,
                    productid: parsedProductid,
                    selectedcolor: color || null,
                    selectedsize: size || null,
                    quantity: quantity || 1,
                },
            });
        }

        const updatedCart = await prisma.cart.findUnique({
            where: cartWhere,
            include: { ProductCart: { include: { Product: true } } },
        });

        res.status(200).json({ success: true, message: "Cart updated", data: updatedCart });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Update cart ───────────────────────────────────────────────────────────
exports.updateCart = async (req, res) => {
    console.log("BODY RECEIVED:", req.body);

    const { userid, cartItemId, quantity, size, color } = req.body;

    // cartItemId is the ProductCart row's primary key — required
    if (!cartItemId) {
        return res.status(400).json({ success: false, message: "cartItemId is required!" });
    }

    // FIX: userid is required for the cart refetch after update
    if (!userid) {
        return res.status(400).json({ success: false, message: "userid is required!" });
    }

    try {
        // 1. Find the exact ProductCart row by its primary key
        const cartItem = await prisma.productCart.findUnique({
            where: { id: Number(cartItemId) },
        });

        console.log("CART ITEM FOUND:", cartItem);

        if (!cartItem) {
            return res.status(404).json({ success: false, message: "Cart item not found!" });
        }

        // 2. Build update payload — only include fields that were sent
        const payload = {
            ...(quantity !== undefined && { quantity: Number(quantity) }),
            ...(size !== undefined && { selectedsize: size }),
            ...(color !== undefined && { selectedcolor: color }),
        };

        if (Object.keys(payload).length === 0) {
            return res.status(400).json({ success: false, message: "No fields to update!" });
        }

        // 3. Update by primary key
        const updated = await prisma.productCart.update({
            where: { id: cartItem.id },
            data: payload,
        });

        console.log("UPDATED ROW:", updated);

        // 4. FIX: Verify the user's cart actually exists before trying to return it
        const userCart = await prisma.cart.findUnique({
            where: { userid: Number(userid) },
        });

        if (!userCart) {
            // The update succeeded but we can't find the cart to return —
            // return the updated row directly so the frontend can patch locally
            return res.status(200).json({
                success: true,
                message: "Cart item updated successfully",
                data: { ProductCart: [] },
                updatedItem: updated,
            });
        }

        // 5. Return the full refreshed cart with product details
        const updatedUserCart = await prisma.cart.findUnique({
            where: { userid: Number(userid) },
            include: {
                ProductCart: {
                    include: { Product: true },
                },
            },
        });

        return res.status(200).json({
            success: true,
            message: "Cart item updated successfully",
            data: updatedUserCart,
        });

    } catch (error) {
        console.log("UPDATE ERROR:", error.message);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Delete from cart ──────────────────────────────────────────────────────
exports.deleteCart = async (req, res) => {
    const { userid, productid } = req.body;
    console.log("DELETE BODY:", req.body);

    const parseduserid = parseInt(userid);
    const parsedproductid = parseInt(productid);

    try {
        const existingCart = await prisma.cart.findUnique({
            where: { userid: parseduserid },
        });

        if (!existingCart) {
            return res.status(400).json({ success: false, message: "User cart does not exist!" });
        }

        const existingCartItem = await prisma.productCart.findUnique({
            where: {
                productid_cartid: {
                    productid: parsedproductid,
                    cartid: existingCart.id,
                },
            },
        });

        if (!existingCartItem) {
            return res.status(400).json({ success: false, message: "Cart item does not exist!" });
        }

        if (existingCartItem.quantity > 1) {
            await prisma.productCart.update({
                where: {
                    productid_cartid: {
                        productid: parsedproductid,
                        cartid: existingCart.id,
                    },
                },
                data: { quantity: existingCartItem.quantity - 1 },
            });
        } else {
            await prisma.productCart.delete({
                where: {
                    productid_cartid: {
                        productid: parsedproductid,
                        cartid: existingCart.id,
                    },
                },
            });
        }

        const updatedUserCart = await prisma.cart.findUnique({
            where: { userid: parseduserid },
            include: {
                ProductCart: { include: { Product: true } },
            },
        });

        return res.status(200).json({
            success: true,
            message: "Cart updated successfully",
            data: updatedUserCart,
        });

    } catch (error) {
        console.log("DELETE ERROR:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Get cart ──────────────────────────────────────────────────────────────
exports.getCart = async (req, res) => {
    const { userid } = req.params;
    const parseduserid = parseInt(userid);

    try {
        const userCart = await prisma.cart.findUnique({
            where: { userid: parseduserid },
            include: {
                ProductCart: { include: { Product: true } },
            },
        });

        if (!userCart) {
            return res.status(400).json({ success: false, message: "User cart does not exist!" });
        }

        res.status(200).json({
            success: true,
            message: "User cart fetched successfully",
            data: userCart,
        });

    } catch (error) {
        console.log("GET CART ERROR:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};