const express = require("express");
const { createProduct, getAllProducts, getSingleProduct, updateProduct, deleteProduct } = require("../controllers/productController");
const uploads = require("../middlewares/uploads");
const { isUser, isAdmin, isSameUser } = require("../middlewares/auth");

const productRouter = express.Router();


productRouter.post("/createProduct", isUser, isAdmin, uploads.single("image"), createProduct);
productRouter.get("/getAllProduct", getAllProducts)
productRouter.get("/getSingleProduct/:id", getSingleProduct )
productRouter.patch("/updateProduct",  isUser, isAdmin, updateProduct )
productRouter.delete("/deleteProduct",  isUser, isAdmin,  deleteProduct)

module.exports = productRouter