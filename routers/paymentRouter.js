const express = require("express");
const { isUser } = require("../middlewares/auth");
const paymentRouter = express.Router();
const { initializePayment, verifyPayment } = require("../controllers/paymentController");

paymentRouter.post("/initializePayment", isUser, initializePayment);
paymentRouter.post("/verifyPayment", isUser, verifyPayment);
module.exports = paymentRouter;