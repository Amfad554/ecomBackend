const express = require("express");
const { createProduct, getAllProducts, getSingleProduct, updateProduct, deleteProduct } = require("../controllers/productController");
const uploads = require("../middlewares/uploads");
const { isUser, isAdmin, isSameUser } = require("../middlewares/auth");

const productRouter = express.Router();


/**
 * @swagger
 * /createProduct:
 *   post:
 *     summary: Create a new product
 *     tags:
 *       - Product
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - currency
 *               - sizes
 *               - defaultSize
 *               - colors
 *               - defaultColor
 *               - bestSeller
 *               - subcategory
 *               - rating
 *               - discount
 *               - newArrival
 *               - tags
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Product name
 *                 example: "Classic T-Shirt"
 *               description:
 *                 type: string
 *                 description: Product description
 *                 example: "Comfortable cotton t-shirt"
 *               price:
 *                 type: number
 *                 description: Product price
 *                 example: 29.99
 *               currency:
 *                 type: string
 *                 description: Currency code
 *                 example: "USD"
 *               sizes:
 *                 type: string
 *                 description: Available sizes (comma-separated or JSON string)
 *                 example: "S,M,L,XL"
 *               defaultSize:
 *                 type: string
 *                 description: Default size
 *                 example: "M"
 *               colors:
 *                 type: string
 *                 description: Available colors (comma-separated or JSON string)
 *                 example: "Red,Blue,Green"
 *               defaultColor:
 *                 type: string
 *                 description: Default color
 *                 example: "Blue"
 *               bestSeller:
 *                 type: boolean
 *                 description: Mark as best seller
 *                 example: true
 *               subcategory:
 *                 type: string
 *                 description: Product subcategory
 *                 example: "Casual Wear"
 *               rating:
 *                 type: number
 *                 description: Product rating (0-5)
 *                 example: 4.5
 *               discount:
 *                 type: number
 *                 description: Discount percentage
 *                 example: 10
 *               newArrival:
 *                 type: boolean
 *                 description: Mark as new arrival
 *                 example: true
 *               tags:
 *                 type: string
 *                 description: Product tags (comma-separated or JSON string)
 *                 example: "casual,summer,cotton"
 *               categoryId:
 *                 type: integer
 *                 description: Category ID
 *                 example: 1
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Product image file
 *     responses:
 *       201:
 *         description: Product created successfully
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
 *                   example: Product created successfully!
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     price:
 *                       type: number
 *                     currency:
 *                       type: string
 *                     sizes:
 *                       type: string
 *                     defaultSize:
 *                       type: string
 *                     colors:
 *                       type: string
 *                     defaultColor:
 *                       type: string
 *                     bestSeller:
 *                       type: boolean
 *                     subcategory:
 *                       type: string
 *                     rating:
 *                       type: number
 *                     discount:
 *                       type: number
 *                     newArrival:
 *                       type: boolean
 *                     tags:
 *                       type: string
 *                     categoryId:
 *                       type: integer
 *                     image:
 *                       type: string
 *       400:
 *         description: Missing field or product already exists
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /getSingleProduct/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     tags:
 *       - Product
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Product retrieved successfully
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
 *                   example: Product retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     price:
 *                       type: number
 *                     description:
 *                       type: string
 *                     image:
 *                       type: string
 *                     categoryId:
 *                       type: string
 *       400:
 *         description: Unable to get product
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
productRouter.get("/getSingleProduct/:id", getSingleProduct)

/**
 * @swagger
 * /updateProduct:
 *   patch:
 *     summary: Update a product
 *     tags:
 *       - Product
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - value
 *             properties:
 *               id:
 *                 type: string
 *                 description: The product ID
 *                 example: "1"
 *               value:
 *                 type: object
 *                 description: Object containing the fields to update
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: "Updated Product Name"
 *                   price:
 *                     type: number
 *                     example: 99.99
 *                   description:
 *                     type: string
 *                     example: "Updated product description"
 *                   image:
 *                     type: string
 *                     example: "https://example.com/image.jpg"
 *                   categoryId:
 *                     type: string
 *                     example: "2"
 *     responses:
 *       200:
 *         description: Product updated successfully
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
 *                   example: Product updated successfully!
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     price:
 *                       type: number
 *                     description:
 *                       type: string
 *                     image:
 *                       type: string
 *                     categoryId:
 *                       type: string
 *       400:
 *         description: Product does not exist in database
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
productRouter.patch("/updateProduct", isUser, isAdmin, updateProduct)

/**
 * @swagger
 * /deleteProduct:
 *   delete:
 *     summary: Delete a product
 *     tags:
 *       - Product
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 description: The product ID to delete
 *                 example: "1"
 *     responses:
 *       200:
 *         description: Product deleted successfully
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
 *                   example: Product deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     price:
 *                       type: number
 *                     description:
 *                       type: string
 *                     image:
 *                       type: string
 *                     categoryId:
 *                       type: string
 *       400:
 *         description: Product does not exist in database or unable to delete
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
productRouter.delete("/deleteProduct", isUser, isAdmin, deleteProduct)

module.exports = productRouter