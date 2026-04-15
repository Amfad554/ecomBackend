// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const multer = require('multer');

// 1. IMPORT YOUR AUTH MIDDLEWARE
// (Assuming your middleware file is named authMiddleware.js)
const { isUser, isAdmin } = require('../middleware/authMiddleware');

// 2. EXTRACT getMe FROM YOUR CONTROLLER
const { registerUser, loginUser, verifyEmail, getAllUsers, deleteUser, updateRole, updateProfile, getMe } = userController;

const upload = multer({ storage: multer.memoryStorage() });

router.post('/register', upload.single('image'), registerUser);
router.post('/login', loginUser);
router.post('/verifyemail', verifyEmail);
router.get('/all', isUser, isAdmin, getAllUsers); // Example of using auth
router.delete('/delete/:id', isUser, isAdmin, deleteUser);
router.put('/update-role/:id', isUser, isAdmin, updateRole);
router.put('/update-profile/:id', isUser, updateProfile); 

// 3. FIXED LINE: Change 'protect' to 'isUser'
router.get("/me", isUser, getMe); 

module.exports = router;