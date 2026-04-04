const express = require('express');
const { createCategory, getAllCategories, getSingleCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const categoryRouter = express.Router();


categoryRouter.post("/createCategory", createCategory )
categoryRouter.get("/getAllCategories", getAllCategories )
categoryRouter.get("/getSingleCategory/:name", getSingleCategory )
categoryRouter.patch("/updateCategory", updateCategory )
categoryRouter.delete("/deleteCategory", deleteCategory)

module.exports = { categoryRouter };