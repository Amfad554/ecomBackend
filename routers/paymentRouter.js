const express = require("express");
const { isUser } = require("../middlewares/auth");
const paymentRouter = express.Router();
const { initializePayment, verifyPayment } = require("../controllers/paymentController");

/**
 * @swagger
 * /initializePayment:
 *   post:
 *     summary: Initialize payment for cart items
 *     tags:
 *       - Payment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: "user@example.com"
 *     responses:
 *       201:
 *         description: Payment initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Payment initialized successfully
 *                 link:
 *                   type: string
 *                   description: Flutterwave payment link
 *                   example: "https://checkout.flutterwave.com/..."
 *                 order_id:
 *                   type: string
 *                   description: Unique order identifier
 *                   example: "550e8400-e29b-41d4-a716-446655440000"
 *       400:
 *         description: User does not exist or user cart does not exist
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error or payment initialization failed
 */
paymentRouter.post("/initializePayment", isUser, initializePayment);

/**
 * @swagger
 * /verifyPayment:
 *   post:
 *     summary: Verify payment transaction and generate receipt
 *     tags:
 *       - Payment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: transaction_id
 *         schema:
 *           type: string
 *         required: true
 *         description: Flutterwave transaction ID
 *         example: "1234567"
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Payment successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     orderId:
 *                       type: string
 *                     userId:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     amount:
 *                       type: number
 *                     transactionId:
 *                       type: string
 *                     status:
 *                       type: string
 *                     receiptItems:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           receiptId:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           price:
 *                             type: number
 *                           image:
 *                             type: string
 *                           quantity:
 *                             type: integer
 *                           total:
 *                             type: number
 *                           productId:
 *                             type: integer
 *       400:
 *         description: Transaction ID missing, user not found, payment not successful, or payment already verified
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error or payment verification failed
 */
paymentRouter.post("/verifyPayment", isUser, verifyPayment);

module.exports = paymentRouter;