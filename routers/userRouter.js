const express = require('express');
const userRouter = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');
const Uploads = require('../middlewares/uploads');

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