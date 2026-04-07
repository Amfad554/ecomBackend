const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Add to cart
exports.addToCart = async (req, res) => {
    console.log("body>", req.body);

    const { userid, productid, color, size, quantity } = req.body;
    const parseduserid = parseInt(userid);
    const parsedproductid = parseInt(productid);

    try {
        // find or create user cart
        const existingCart = await prisma.cart.upsert({
            where: { userid: parseduserid },
            update: {},
            create: { userid: parseduserid },
        });

        const existingProduct = await prisma.product.findUnique({
            where: { id: parsedproductid },
        });

        if (!existingProduct) {
            return res.status(400).json({
                success: false,
                message: "Product does not exist in database!",
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

        if (existingCartItem) {
            return res.status(400).json({
                success: false,
                message: "Item already exists in cart!",
            });
        }

        const addedCart = await prisma.productCart.create({
            data: {
                Product: { connect: { id: parsedproductid } },  // ✅ capital P
                Cart: { connect: { id: existingCart.id } },      // ✅ capital C
                selectedcolor: color || null,
                selectedsize: size || null,
                quantity: quantity || 1,
            },
        });

        if (!addedCart) {
            return res.status(400).json({
                success: false,
                message: "Unable to add item to cart",
            });
        }

        const userCart = await prisma.cart.findUnique({
            where: { userid: parseduserid },
            include: {
                ProductCart: {                  // ✅ capital P and C
                    include: { Product: true }, // ✅ capital P
                },
            },
        });

        return res.status(201).json({
            success: true,
            message: "Item added to cart successfully",
            data: userCart,
        });
    } catch (error) {
        console.log("error", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error, please try again later!",
        });
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
            where: { id: parsedproductid },
        });

        if (!product) {
            return res.status(400).json({
                success: false,
                message: "Product does not exist!",
            });
        }

        const cartItem = await prisma.productCart.findUnique({
            where: {
                productid_cartid: {
                    productid: parsedproductid,
                    cartid: userCart.id,
                },
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
            where: {
                productid_cartid: {
                    productid: parsedproductid,
                    cartid: userCart.id,
                },
            },
            data: payload,
            include: { Product: true }, // ✅ capital P
        });

        const updatedUserCart = await prisma.cart.findUnique({
            where: { userid: parseduserid },
            include: {
                ProductCart: {                  // ✅ capital P and C
                    include: { Product: true }, // ✅ capital P
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
            message: "Internal server error, please try again later!",
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

            const updatedUserCart = await prisma.cart.findUnique({
                where: { userid: parseduserid },
                include: {
                    ProductCart: {                  // ✅ capital P and C
                        include: { Product: true }, // ✅ capital P
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

        const deletedUserCart = await prisma.cart.findUnique({
            where: { userid: parseduserid },
            include: {
                ProductCart: {                  // ✅ capital P and C
                    include: { Product: true }, // ✅ capital P
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
            message: "Internal server error, please try again later!",
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
                ProductCart: {                  // ✅ capital P and C
                    include: { Product: true }, // ✅ capital P
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
            message: "Internal server error!",
        });
    }
};