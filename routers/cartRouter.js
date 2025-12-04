const express = require("express");
const { addToCart, getCart, updateCart, deleteCart } = require('../controllers/cartController')
const { isUser } = require("../middlewares/auth");
const cartRouter = express.Router()

cartRouter.post('/addcart', isUser, addToCart)
cartRouter.get('/getCart/:userid', isUser, getCart)
cartRouter.patch('/updatecart', isUser, updateCart)
cartRouter.delete('/deletecart', isUser, deleteCart)

module.exports = cartRouter