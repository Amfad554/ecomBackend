const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
dotenv.config();

//initialize payment
exports.initializePayment = async (req, res) => {
    const { email } = req.body;
    const order_id = uuidv4();

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(400).json({ success: false, message: "User does not exist!" });
        }

        const userId = user.id;

        const userCart = await prisma.cart.findUnique({
            where: { userid: userId },
            // Matches your schema: ProductCart (capital C) and Product (capital P)
            include: {
                ProductCart: {
                    include: { Product: true }
                }
            },
        });

        if (!userCart || userCart.ProductCart.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty!" });
        }

        // Logic uses ProductCart and Product to match the 'include' above
        const cartItems = userCart.ProductCart;
        const totalPrice = cartItems.reduce(
            (acc, item) => acc + (item.Product?.price || 0) * (item.quantity || 1),
            0
        );

        const payload = {
            tx_ref: order_id,
            amount: totalPrice,
            currency: 'NGN',
            redirect_url: 'https://granduer.vercel.app/thankyou',
            customer: {
                email: user.email,
                name: `${user.firstname} ${user.lastname}`,
                phonenumber: user.phone || "0000000000"
            },
            meta: { userId: user.id, order_id },
            customizations: { title: 'Granduer', description: 'Payment for items in cart!' }
        };

        const response = await fetch("https://api.flutterwave.com/v3/payments", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                success: false,
                message: data.message || "Flutterwave initialization failed"
            });
        }

        return res.status(200).json({
            success: true,
            link: data.data.link,
            order_id
        });

    } catch (error) {
        console.error("Internal Server Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};


//verify payment
exports.verifyPayment = async (req, res) => {
    const { transaction_id } = req.query;

    if (!transaction_id) {
        return res.status(400).json({ success: false, message: "Transaction ID is missing!" });
    }

    try {
        // 1. Verify with Flutterwave
        const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        if (!response.ok || data.status !== "success" || data.data.status !== "successful") {
            return res.status(400).json({ success: false, message: "Payment verification failed" });
        }

        // 2. Extract Metadata (Note: userId and order_id must match what you sent in initializePayment)
        const id = Number(data.data.meta.userId);
        const order_id = data.data.meta.order_id;

        // 3. Find the User
        const user = await prisma.user.findUnique({ where: { id: id } });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // 4. Get the Cart (Fixed variable name to 'id')
        const userCart = await prisma.cart.findUnique({
            where: { userid: id },
            include: {
                ProductCart: { include: { Product: true } }
            },
        });

        if (!userCart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        // 5. Check if Receipt already exists to prevent duplicates
        const existingReceipt = await prisma.receipt.findUnique({
            where: { orderId: order_id },
            include: { ReceiptItem: true }
        });

        if (existingReceipt) {
            return res.status(200).json({
                success: true,
                message: "Payment already verified",
                data: existingReceipt
            });
        }

        // 6. Create the Receipt
        const newReceipt = await prisma.receipt.create({
            data: {
                orderId: order_id,
                userId: id,
                name: `${user.firstname} ${user.lastname}`,
                email: user.email,
                phone: user.phone || "N/A",
                amount: data.data.amount,
                transactionId: String(transaction_id),
                status: data.data.status,
                // Create ReceiptItems at the same time (Nested Write)
                ReceiptItem: {
                    create: userCart.ProductCart.map(item => ({
                        name: item.Product.name,
                        price: item.Product.price,
                        image: item.Product.image,
                        quantity: item.quantity,
                        total: item.quantity * item.Product.price,
                        productId: item.productid
                    }))
                }
            },
            include: { ReceiptItem: true }
        });

        // 7. Optional: Clear the cart after successful purchase
        await prisma.productCart.deleteMany({
            where: { cartid: userCart.id }
        });

        return res.status(200).json({
            success: true,
            message: "Payment successful and receipt generated",
            data: newReceipt
        });

    } catch (error) {
        console.error("Verification Error:", error);
        // This ensures that even if it fails, it returns JSON, not HTML
        return res.status(500).json({ success: false, message: error.message });
    }
};

