const express = require("express");
const { isUser } = require("../middlewares/auth");
const paymentRouter = express.Router();
const { initializePayment, verifyPayment } = require("../controllers/paymentController");
const paymentController = require('../controllers/paymentController');
paymentRouter.post("/initializePayment", isUser, initializePayment);
// paymentRouter.js
paymentRouter.get("/verifyPayment", isUser, paymentController.verifyPayment);
module.exports = paymentRouter;