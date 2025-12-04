const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createCategory = async (req, res) => {
    const { name } = req.body;

    try {
        if (!name) {
            return res.status(400).json({ message: "Category name is required!" });
        }

        // Check if category already exists
        const existingCategory = await prisma.category.findUnique({
            where: { name }
        });

        if (existingCategory) {
            return res.status(409).json({ message: "Category already exists!" });
        }

        const newCategory = await prisma.category.create({
            data: { name },
        });

        res.status(201).json({
            message: "Category created successfully",
            category: newCategory
        });

    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({
            message: "Internal server error, please try again later!"
        });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const allCategory = await prisma.category.findMany();
        if (!allCategory) {
            return res.status(400).json({ message: "Unable to get categories!" });
        }
        res.status(200).json({
            success: true,
            message: "Categories retrived successfully",
            data: allCategory
        });

    } catch (error) {
        console.error("Error", error.message);
        res.status(500).json({
            message: "Internal server error, please try again later!"
        });
    }
};

exports.getSingleCategory = async (req, res) => {
    const { name } = req.params;
    try {
        const singleCategory = await prisma.category.findUnique({
            where: { name }
        });
        if (!singleCategory) {
            return res.status(400).json({ message: "Category not found!" });
        }
        res.status(200).json({
            success: true,
            message: "Category retrived successfully",
            data: singleCategory
        });
    } catch (error) {
        console.log("error", error.message);
        res.status(500).json({
            message: "Internal server error, please try again later!"
        });
    }
};

exports.updateCategory = async (req, res) => {
    const { name, id } = req.body;

    const parsedId = parseInt(id);
    try {
        //check if category exists
        const existingCategory = await prisma.category.findUnique({
            where: { id: parsedId }
        });

        if (!existingCategory) {
            return res.status(400).json({ success: false, message: "Category does not exist in database!" });
        }
        const updatedCategory = await prisma.category.update({
            where: { id },
            data: { name },
        });
        if (!updatedCategory) {
            return res.status(400).json({ success: false, message: "Unable to update category!" });
        }
        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: updatedCategory
        });
    } catch (error) {
        console.log("error", error.message);
        return res.status(500).json({
            message: "Internal server error, please try again later!"
        });
    }
};

exports.deleteCategory = async (req, res) => {
    const { id } = req.body;

    const parsedId = parseInt(id);
    try {
        const existingCategory = await prisma.category.findUnique({
            where: { id: parsedId }
        });

        if (!existingCategory) {
            return res.status(400).json({ success: false, message: "Category does not exist in database!" });
        }

        const deletedCategory = await prisma.category.delete({
            where: { id: parsedId }
        });
        if (!deletedCategory) {
            return res.status(400).json({ success: false, message: "Unable to delete category!" });
        }
        return res.status(200).json({
            success: true,
            message: "Category deleted successfully",
            data: deletedCategory
        });
    } catch (error) {
        console.log("error", error.message);
        return res.status(500).json({
            message: "Internal server error, please try again later!"
        });
    }
};
