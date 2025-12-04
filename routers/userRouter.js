const express = require('express');
const userRouter = express.Router();
const { registerUser, loginUser } = require('../controllers/userController');
const Uploads = require('../middlewares/uploads');

userRouter.post("/registerUser", Uploads.single("image"), registerUser);
userRouter.post("/loginUser",  loginUser);


module.exports = userRouter;