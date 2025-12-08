const express = require('express');
const userRouter = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');
const Uploads = require('../middlewares/uploads');

/**
* @swagger
* /registerUser:
*   post:
*     summary: Register a new user
*     tags:
*       - User
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - firstname
*               - lastname
*               - email
*               - phone
*               - address
*               - password
*               - confirmpassword
*             properties:
*               firstname:
*                 type: string
*                 description: User's first name
*               lastname:
*                 type: string
*                 description: User's last name
*               email:
*                 type: string
*                 format: email
*                 description: User's email address
*               phone:
*                 type: string
*                 description: User's phone number
*               address:
*                 type: string
*                 description: User's address
*               password:
*                 type: string
*                 format: password
*                 description: User's password
*               confirmpassword:
*                 type: string
*                 format: password
*                 description: Password confirmation
*               image:
*                 type: string
*                 description: User's profile image (URL or base64 encoded string)
*     responses:
*       200:
*         description: Registration successful
*       400:
*         description: Validation error - missing required field
*/
userRouter.post("/registerUser", Uploads.single("image"), registerUser);

/**
* @swagger
* /loginUser:
*   post:
*     summary: 
*     tags:
*       - User
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               email:
*                 type: string
*               password:
*                 type: string
*     responses:
*       200:
*         description: Login successful
*/
userRouter.post("/loginUser", loginUser);


module.exports = userRouter;