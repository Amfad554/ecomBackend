const express = require("express");
const { createProduct, getAllProducts, getSingleProduct, updateProduct, deleteProduct } = require("../controllers/productController");
const uploads = require("../middlewares/uploads");
const { isUser, isAdmin, isSameUser } = require("../middlewares/auth");

const productRouter = express.Router();


productRouter.post("/createProduct", isUser, isAdmin, uploads.single("image"), createProduct);
/**
 * @swagger
 * /getAllProduct:
 *   get:
 *     summary: Get all products
 *     tags:
 *       - Product
 *     responses:
 *       200:
 *         description: Products retrieved successfully
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
 *                   example: Products retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                       description:
 *                         type: string
 *                       image:
 *                         type: string
 *                       categoryId:
 *                         type: string
 *       400:
 *         description: Unable to get products
 *       500:
 *         description: Internal server error
 */
productRouter.get("/getAllProduct", getAllProducts)
productRouter.get("/getSingleProduct/:id", getSingleProduct )
productRouter.patch("/updateProduct",  isUser, isAdmin, updateProduct )
productRouter.delete("/deleteProduct",  isUser, isAdmin,  deleteProduct)

module.exports = productRouter