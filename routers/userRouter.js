// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const multer = require('multer'); // 1. Import multer

// 2. Initialize multer (using memory storage so we get req.file.buffer)
const upload = multer({ storage: multer.memoryStorage() });

// 3. Add upload.single('image') to the register route
// The string 'image' MUST match the key used in your frontend: formData.append("image", ...)
router.post('/register', upload.single('image'), userController.registerUser);

router.post('/login', userController.loginUser);
router.post('/verifyemail', userController.verifyEmail);
router.get('/all', userController.getAllUsers);
router.delete('/delete/:id', userController.deleteUser);
router.put('/update-role/:id', userController.updateRole);
router.put('/update-profile/:id', userController.updateProfile); 
// userRoutes.js
router.get("/me", protect, getMe); // protect = your JWT auth middleware

module.exports = router;