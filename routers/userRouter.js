// routes/userRoutes.js
const express = require('express'); // 1. Import Express
const router = express.Router();    // 2. Create the router object
const userController = require('../controllers/userController'); // 3. Import your controller

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/verifyemail', userController.verifyEmail);
router.get('/all', userController.getAllUsers);
router.delete('/delete/:id', userController.deleteUser);
router.put('/update-role/:id', userController.updateRole);

// Profile update route
router.put('/update-profile/:id', userController.updateProfile); 

module.exports = router;