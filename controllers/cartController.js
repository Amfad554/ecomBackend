const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ─── Add to cart ───────────────────────────────────────────────────────────
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

        // ✅ Fixed: use correct variable names from req.body
        const existingItem = await prisma.productCart.findFirst({
            where: {
                productid: parsedProductid,   // was: productid (unparsed), cartid (undefined)
                cartid: existingCart.id,       // was: cartid (undefined)
                selectedcolor: color || null,  // was: selectedcolor (undefined)
                selectedsize: size || null,    // was: selectedsize (undefined)
            }
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
exports.updateCart = async (req, res) => {
    const { userid, cartItemId, quantity, size, color } = req.body;

    if (!cartItemId || !userid) {
        return res.status(400).json({ success: false, message: "userid and cartItemId are required!" });
    }

    try {
        // 1. Get the current item to know its productid
        const currentItem = await prisma.productCart.findUnique({
            where: { id: Number(cartItemId) },
        });

        if (!currentItem) {
            return res.status(404).json({ success: false, message: "Cart item not found!" });
        }

        // 2. CHECK FOR COLLISION: If size/color changed, does the new variant already exist?
        const targetSize = size !== undefined ? size : currentItem.selectedsize;
        const targetColor = color !== undefined ? color : currentItem.selectedcolor;

        const existingVariant = await prisma.productCart.findFirst({
            where: {
                cartid: currentItem.cartid,
                productid: currentItem.productid,
                selectedsize: targetSize,
                selectedcolor: targetColor,
                id: { not: currentItem.id } // Don't match the same row
            }
        });

        if (existingVariant) {
            // MERGE: Update the other row and delete this one
            await prisma.productCart.update({
                where: { id: existingVariant.id },
                data: { quantity: existingVariant.quantity + (Number(quantity) || currentItem.quantity) }
            });
            await prisma.productCart.delete({ where: { id: currentItem.id } });
        } else {
            // NORMAL UPDATE: Update the current row
            await prisma.productCart.update({
                where: { id: currentItem.id },
                data: {
                    ...(quantity !== undefined && { quantity: Number(quantity) }),
                    ...(size !== undefined && { selectedsize: size }),
                    ...(color !== undefined && { selectedcolor: color }),
                },
            });
        }

        // 3. Return the full refreshed cart (Standardized Response)
        const updatedUserCart = await prisma.cart.findUnique({
            where: { userid: Number(userid) },
            include: { ProductCart: { include: { Product: true } } },
        });

        return res.status(200).json({
            success: true,
            message: "Cart updated successfully",
            data: updatedUserCart,
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Delete from cart ──────────────────────────────────────────────────────
exports.deleteCart = async (req, res) => {
    const { userid, cartItemId } = req.body; // Suggest passing cartItemId (primary key) instead of productid

    try {
        // Delete the specific row directly using its ID
        await prisma.productCart.delete({
            where: { id: Number(cartItemId) }
        });

        const updatedUserCart = await prisma.cart.findUnique({
            where: { userid: Number(userid) },
            include: { ProductCart: { include: { Product: true } } },
        });

        return res.status(200).json({
            success: true,
            message: "Item removed from cart",
            data: updatedUserCart,
        });
    } catch (error) {
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