const { PrismaClient } = require('@prisma/client');
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const prisma = new PrismaClient();

exports.createProduct = async (req, res) => {

    const {
        name,
        description,
        price,
        currency,
        sizes,
        defaultSize,
        colors,
        defaultColor,
        bestSeller,
        subcategory,
        rating,
        discount,
        newArrival,
        tags,
        categoryId,
    } = req.body;

    const parsedPrice = parseFloat(price);
    const parsedRating = parseFloat(rating);
    const parsedDiscount = parseFloat(discount);
    const parsedCategoryId = parseInt(categoryId);
    try {

        const requestFields = { ...req.body };

        for (let [key, value] of Object.entries(requestFields)) {
            if (value === undefined || value === null || value === '') {
                return res.status(400).json({
                    success: false,
                    message: `Missing field: ${key}`,
                });
            }
        }

        const existingProduct = await prisma.product.findFirst({
            where: { name },
        });

        if (existingProduct) {
            return res.status(400).json({
                success: false,
                message: 'Product already exists!',
            });
        }

        let imageUrl = null;
        if (req.file) {
            imageUrl = await uploadToCloudinary(req.file.buffer, 'image', 'Product');
        }

        const newProduct = await prisma.product.create({
            data: {
                ...requestFields,
                price: parsedPrice,
                rating: parsedRating,
                discount: parsedDiscount,
                categoryId: parsedCategoryId,
                bestSeller: true,
                newArrival: true,
                image: imageUrl,
            },
        });

        return res.status(201).json({
            success: true,
            message: 'Product created successfully!',
            data: newProduct,
        });
    } catch (error) {
        console.error('Error creating product:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error, please try again later!',
        });
    }
};


exports.getAllProducts = async (req, res) => {
    try {
        const allProducts = await prisma.product.findMany();
        if (!allProducts) {
            return res.status(400).json({ success: false, message: "Unable to get products!" });
        }


        res.status(200).json({
            success: true,
            message: "Products retrieved successfully",
            data: allProducts
        });

    } catch (error) {
        console.log("error", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error, please try again later!"
        });
    }
}

exports.getSingleProduct = async (req, res) => {

    const { id } = req.params;
    const parsedId = parseInt(id);
    try {
        if (!id) {
            return res.status(400).json({ success: false, message: "Product ID is required!" });
        }
        const product = await prisma.product.findUnique({
            where: { id: parsedId }
        });
        if (!product) {
            return res.status(400).json({ success: false, message: "Product not found!" });
        }
        res.status(200).json({
            success: true,
            message: "Product retrieved successfully",
            data: product
        });

    } catch (error) {
        console.log("error", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error, please try again later!"
        });
    }
}

exports.updateProduct = async (req, res) => {
    const { id, value } = req.body;
    const parsedId = parseInt(id);

    try {
        const existingProduct = await prisma.product.findUnique({
            where: { id: parsedId }
        });
        if (!existingProduct) {
            return res.status(400).json({ success: false, message: "Product does not exist in database!" });
        }

        const updatedProduct = await prisma.product.update({
            where: { id: parsedId },
            data: { ...value },
        });

        return res.status(200).json({
            success: true,
            message: "Product updated successfully!",
            data: updatedProduct
        });
    } catch (error) {
        console.log("error", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error, please try again later!"
        });
    }
};


exports.deleteProduct = async (req, res) => {

    const { id } = req.body;
    const parsedId = parseInt(id);
    try {
        //check for existing product
        const existingProduct = await prisma.product.findUnique({
            where: { id: parsedId }
        });
        if (!existingProduct) {
            return res.status(400).json({ success: false, message: "Product does not exist in database!" });
        }
        //delete product
        const deletedProduct = await prisma.product.delete({
            where: { id: parsedId }
        });
        if (!deletedProduct) {
            return res.status(400).json({ success: false, message: "Unable to delete product!" });
        }
        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
            data: deletedProduct
        });
    } catch (error) {
        console.log("error", error.message);
        res.status(500).json({
            success: false,
            message: "Internal server error, please try again later!"
        });
    }
}