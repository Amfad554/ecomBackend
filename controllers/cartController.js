const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ─── Add to Cart ──────────────────────────────────────────────────────────
exports.addToCart = async (req, res) => {
    const { userid, guestId, productid, color, size, quantity } = req.body;
    const parsedProductid = parseInt(productid);

    try {
        const cartWhere = userid ? { userid: parseInt(userid) } : { guestId: guestId };

        // Ensure the cart exists
        const existingCart = await prisma.cart.upsert({
            where: cartWhere,
            update: {},
            create: cartWhere,
        });

        // Check if this specific variant (product + color + size) is already in this cart
        const existingItem = await prisma.productCart.findFirst({
            where: {
                productid: parsedProductid,
                cartid: existingCart.id,
                selectedcolor: color || null,
                selectedsize: size || null,
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

        res.status(200).json({ success: true, message: "Item added to cart", data: updatedCart });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Update Cart (With Collision/Merge Logic) ─────────────────────────────
exports.updateCart = async (req, res) => {
    const { userid, cartItemId, quantity, size, color } = req.body;

    if (!cartItemId || !userid) {
        return res.status(400).json({ success: false, message: "userid and cartItemId are required!" });
    }

    try {
        // 1. Find the current row to get its context
        const currentItem = await prisma.productCart.findUnique({
            where: { id: Number(cartItemId) },
        });

        if (!currentItem) {
            return res.status(404).json({ success: false, message: "Cart item not found!" });
        }

        // 2. Identify the "target" state (what we want this item to become)
        const targetSize = size !== undefined ? size : currentItem.selectedsize;
        const targetColor = color !== undefined ? color : currentItem.selectedcolor;
        const targetQuantity = quantity !== undefined ? Number(quantity) : currentItem.quantity;

        // 3. Collision Check: Does another row already have this variant?
        const duplicateVariant = await prisma.productCart.findFirst({
            where: {
                cartid: currentItem.cartid,
                productid: currentItem.productid,
                selectedsize: targetSize,
                selectedcolor: targetColor,
                id: { not: currentItem.id } // exclude current row
            }
        });

        if (duplicateVariant) {
            // MERGE: Update the existing row with combined quantity and delete the current row
            await prisma.productCart.update({
                where: { id: duplicateVariant.id },
                data: { quantity: duplicateVariant.quantity + targetQuantity }
            });
            await prisma.productCart.delete({ where: { id: currentItem.id } });
        } else {
            // NORMAL UPDATE: No conflict, just update the row
            await prisma.productCart.update({
                where: { id: currentItem.id },
                data: {
                    quantity: targetQuantity,
                    selectedsize: targetSize,
                    selectedcolor: targetColor,
                },
            });
        }

        // 4. Return refreshed cart
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

exports.deleteCart = async (req, res) => {
    // 1. Destructure the ID from the body
    const { userid, cartItemId } = req.body;

    // 2. Debug: Check if cartItemId actually exists here
    console.log("Delete Request - UserID:", userid, "ItemID:", cartItemId);

    if (!cartItemId) {
        return res.status(400).json({ 
            success: false, 
            message: "cartItemId is required to delete an item!" 
        });
    }

    try {
        await prisma.productCart.delete({
            where: { 
                // Ensure this is a Number. If cartItemId is undefined, 
                // Prisma throws the error you saw.
                id: Number(cartItemId) 
            }
        });

        // Return refreshed cart...
        const updatedUserCart = await prisma.cart.findUnique({
            where: { userid: Number(userid) },
            include: { ProductCart: { include: { Product: true } } },
        });

        res.status(200).json({ success: true, data: updatedUserCart });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Get Cart ──────────────────────────────────────────────────────────────
exports.getCart = async (req, res) => {
    const { userid } = req.params;

    try {
        const userCart = await prisma.cart.findUnique({
            where: { userid: parseInt(userid) },
            include: { ProductCart: { include: { Product: true } } },
        });

        if (!userCart) {
            return res.status(200).json({ success: true, data: { ProductCart: [] } });
        }

        res.status(200).json({
            success: true,
            message: "User cart fetched successfully",
            data: userCart,
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};