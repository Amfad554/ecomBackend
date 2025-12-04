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
            return res.status(400).json({
                success: false,
                message: "User does not exist!",
            });
        }

        const userCart = await prisma.cart.findUnique({
            where: { userid: parseInt(user.id) },
            include: { Productcart: { include: { product: true } } },
        });

        if (!userCart) {
            return res.status(400).json({
                success: false,
                message: "User cart does not exist!",
            });
        }

        const cartItems = userCart.Productcart;

        const totalPrice = cartItems.reduce(
            (acc, item) => acc + (item.product?.price || 0) * (item.quantity || 1),
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
                phonenumber: user.phone
            },

            meta: {
                userId: user.id,
                order_id,
            },

            customizations: {
                title: 'Granduer',
                description: 'Payment for items in cart!'
            }
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

        if (!response.ok || data.status !== "success") {
            return res.status(500).json({
                success: false,
                message: data.message || "Something went wrong, please try again later!"
            });
        }

        return res.status(201).json({
            success: true,
            message: "Payment initialized successfully",
            link: data.data.link,
            order_id
        });

    } catch (error) {
        console.log("error", error.message);
        return res.status(500).json({
            success: false,
            message: "Internal server error, please try again later!"
        });
    }
};


//verify payment
exports.verifyPayment = async (req, res) => {
    const { transaction_id } = req.query;

    if (!transaction_id) return res.status(400).json({ success: false, message: "Transaction ID is missing!" });

    try {
        const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        // validate response
        if (!response.ok || data.status !== "success") {
            return res.status(400).json({
                success: false,
                message: data.message || "Payment verification failed"
            });
        }

        // Ensure data.data exists before checking status
        if (!data.data || data.data.status !== "successful") {
            return res.status(400).json({
                success: false,
                message: "Payment not successful",
                paymentStatus: data?.data?.status
            });
        }

        const id = Number(data?.data?.meta?.userId);
        const order_id = data?.data?.meta?.order_id;

        const amount = data?.data?.amount;
        const status = data?.data?.status;

        console.log("id", id);

        // find user
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(400).json({ success: false, message: "User does not exist in Database" });
        }

        const userCart = await prisma.cart.findUnique({
            where: { userid: id },
            include: { Productcart: { include: { product: true } } }
        });

        if (!userCart) {
            return res.status(400).json({ success: false, message: "Usercart does not exist in Database" });
        }

        // check for existing receipt
        const existingReceipt = await prisma.receipt.findUnique({
            where: { orderId: order_id }, include: { receiptItems: true }
        });

        if (existingReceipt) {

            // const cartItems = await prisma.receiptItem.createMany({
            //     data: userCart.Productcart.map(item => ({
            //         receiptId: existingReceipt.id,
            //         name: item.product.name,
            //         price: item.product.price,
            //         image: item.product.image,
            //         quantity: item.quantity,
            //         total: item.quantity * item.product.price,
            //         productId: item.productid
            //     }))
            // });

            const updatedReciept = await prisma.receipt.findUnique({
                where: { orderId: order_id },
                include: { receiptItems: true }
            })
            return res.status(200).json({
                success: true,
                message: "Payment already verified",
                data: updatedReciept,
        

            });
        }

        const newReceipt = await prisma.receipt.create({
            data: {
                orderId: order_id,
                userId: id,
                name: `${user.firstname} ${user.lastname}`,
                email: user.email,
                phone: user.phone,
                amount: amount,
                transactionId: transaction_id,
                status: status
            }
        });

        if (!newReceipt) {
            return res.status(400).json({ success: false, message: "Unable to generate receipt" });
        }
        const cartItems = await prisma.receiptItem.createMany({
            data: userCart.Productcart.map(item => ({
                receiptId: newReceipt.id,
                name: item.product.name,
                price: item.product.price,
                image: item.product.image,
                quantity: item.quantity,
                total: item.quantity * item.product.price,
                productId: item.productid
            }))
        });

        // const updatedReceipt = await prisma.receipt.findUnique({
        //     where: { orderId: order_id },
        //     include: { receiptItems: true }
        // });

        return res.status(200).json({
            success: true,
            message: "Payment successful",
            data: newReceipt,
        });

    } catch (error) {
        console.error("Error verifying payment:", error.message);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

