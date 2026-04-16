const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Add to cart
exports.addToCart = async (req, res) => {
    const { userid, guestId, productid, color, size, quantity } = req.body;
    const parsedProductid = parseInt(productid);

    try {
        // 1. Identify the cart (by user OR guest)
        const cartWhere = userid
            ? { userid: parseInt(userid) }
            : { guestId: guestId };

        const existingCart = await prisma.cart.upsert({
            where: cartWhere,
            update: {},
            create: cartWhere,
        });

        // 2. Check if THIS SPECIFIC variation exists
        const existingItem = await prisma.productCart.findFirst({
            where: {
                cartid: existingCart.id,
                productid: parsedProductid,
                selectedcolor: color || null,
                selectedsize: size || null,
            },
        });

        if (existingItem) {
            // If it exists, just increase quantity
            await prisma.productCart.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + (quantity || 1) },
            });
        } else {
            // Create new record for this variation
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

        res.status(200).json({ success: true, message: "Cart updated" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update cart
exports.updateCart = async (req, res) => {
    console.log("body>", req.body);
    const { userid, productid, size, color, quantity } = req.body;
    const parseduserid = Number(userid);
    const parsedproductid = Number(productid);

    try {
        const userCart = await prisma.cart.findUnique({
            where: { userid: parseduserid },
        });

        if (!userCart) {
            return res.status(400).json({
                success: false,
                message: "Cart does not exist for this user!",
            });
        }

        const product = await prisma.product.findUnique({
            where: { id: Number(cartItemId) },
        });

        if (!product) {
            return res.status(400).json({
                success: false,
                message: "Product does not exist!",
            });
        }

        // Change this logic in your backend controller
        const cartItem = await prisma.productCart.findFirst({ // Use findFirst, not findUnique
            where: {
                cartid: userCart.id,
                productid: parsedproductid,
                // If you are using variations, you MUST include these to find the right row
                selectedcolor: color || null,
                selectedsize: size || null,
            },
        });

        if (!cartItem) {
            return res.status(400).json({
                success: false,
                message: "Item does not exist in user cart!",
            });
        }

        const payload = {
            ...(quantity !== undefined && { quantity: Number(quantity) }),
            ...(size !== undefined && { selectedsize: size }),
            ...(color !== undefined && { selectedcolor: color }),
        };

        if (Object.keys(payload).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields to update!",
            });
        }

        await prisma.productCart.update({
            where: { id: cartItem.id },  // ✅ update by primary key
            data: payload,
        });
        // ✅ ProductCart and Product match schema exactly
        const updatedUserCart = await prisma.cart.findUnique({
            where: { userid: parseduserid },
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
        console.log("error", error.message);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete cart
exports.deleteCart = async (req, res) => {
    const { userid, productid } = req.body;
    console.log(req.body);

    const parseduserid = parseInt(userid);
    const parsedproductid = parseInt(productid);

    try {
        const existingCart = await prisma.cart.findUnique({
            where: { userid: parseduserid },
        });

        if (!existingCart) {
            return res.status(400).json({
                success: false,
                message: "User cart does not exist!",
            });
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
            return res.status(400).json({
                success: false,
                message: "Cart item does not exist!",
            });
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

            // ✅ ProductCart and Product match schema exactly
            const updatedUserCart = await prisma.cart.findUnique({
                where: { userid: parseduserid },
                include: {
                    ProductCart: {
                        include: { Product: true },
                    },
                },
            });

            return res.status(200).json({
                success: true,
                message: "Product quantity reduced in cart",
                data: updatedUserCart,
            });
        }

        await prisma.productCart.delete({
            where: {
                productid_cartid: {
                    productid: parsedproductid,
                    cartid: existingCart.id,
                },
            },
        });

        // ✅ ProductCart and Product match schema exactly
        const deletedUserCart = await prisma.cart.findUnique({
            where: { userid: parseduserid },
            include: {
                ProductCart: {
                    include: { Product: true },
                },
            },
        });

        return res.status(200).json({
            success: true,
            message: "Cart item deleted successfully",
            data: deletedUserCart,
        });

    } catch (error) {
        console.log("error", error.message);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get cart
exports.getCart = async (req, res) => {
    const { userid } = req.params;
    const parseduserid = parseInt(userid);

    try {
        const userCart = await prisma.cart.findUnique({
            where: { userid: parseduserid },
            include: {
                ProductCart: {
                    include: { Product: true },
                },
            },
        });

        if (!userCart) {
            return res.status(400).json({
                success: false,
                message: "User cart does not exist!",
            });
        }

        res.status(200).json({
            success: true,
            message: "User cart fetched successfully",
            data: userCart,
        });

    } catch (error) {
        console.log("error", error.message);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};