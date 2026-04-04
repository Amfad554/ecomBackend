const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const bcrypt = require('bcrypt');
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const { sendVerification } = require("../utils/emailVerification");
const generateToken = require("../utils/generateToken");
const jwt = require("jsonwebtoken");   // <-- FIXED (you forgot this)

exports.registerUser = async (req, res) => {
  const { firstname, lastname, email, phone, address, password, confirmpassword } = req.body
  try {
    if (!firstname) {
      return res.status(400).json({ success: false, message: "First name is required!" })
    }
    if (!lastname) {
      return res.status(400).json({ success: false, message: "Last name is required!" })
    }
    if (!email) {
      return res.status(400).json({ success: false, message: "Missing email field!" })
    }
    if (!phone) {
      return res.status(400).json({ success: false, message: "Missing phone number field!" })
    }
    if (!address) {
      return res.status(400).json({ success: false, message: "Missing address field!" })
    }
    if (!password) {
      return res.status(400).json({ success: false, message: "Missing password field!" })
    }
    if (!confirmpassword) {
      return res.status(400).json({ success: false, message: "Missing confirm password field!" })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format!" });
    }

    const passwordRegex = /^[A-Z](?=.*[\W_])/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must start with an uppercase letter and include at least one special character.",
      });
    }

    if (password !== confirmpassword) {
      return res.status(400).json({ success: false, message: "Password and confirm password do not match!" });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    let imageUrl;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, "image", "Users");
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User with this email already exists!" });
    }

    const newUser = await prisma.user.create({
      data: {
        firstname,
        lastname,
        email,
        phone,
        address,
        password: hashedPassword,
        image: imageUrl || null,
        isVerified: false           
      }
    });

    if (!newUser) {
      return res.status(400).json({ success: true, message: "User creation failed!", data: newUser });
    }

    // FIXED: JWT + link format
    const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY, {
      expiresIn: '15m'
    });

    const verificationLink = `https://granduer.vercel.app/verifyemail/${token}  `;

    await sendVerification(newUser.email, verificationLink);

    return res.status(201).json({
      success: true,
      message: "User created successfully!",
      data: newUser
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error, please try again later!",
      error: error.message
    });
  }
};



exports.verifyEmail = async (req, res) => {
  const { token } = req.body;

  try {
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "No token provided!"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const user = await prisma.user.findUnique({
      where: { email: decoded.email }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!"
      });
    }

    // Update user
    await prisma.user.update({
      where: { email: user.email },
      data: { isVerified: true }
    });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully!"
    });

  } catch (error) {
    console.log("Verify error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later."
    });
  }
};



exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email feild is not provided!" });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: "Password feild is not provided!" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User with this email does not exist in database!",
      });
    }

    const validatePassword = await bcrypt.compare(password, user.password);

    if (!validatePassword) {
      return res.status(400).json({ success: false, message: "Password is incorrect!" });
    }

    if (!user.isVerified) {
      console.log("not verified!");
      const key =  process.env.JWT_SECRET_KEY
            console.log("key", key);
      const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY, {
        expiresIn: '15m'
      });


      

      const verificationLink = `http://localhost:5173/verifyemail/${token}`;
      await sendVerification(user.email, verificationLink);

      return res.status(200).json({
        success: false,
        message: "Please check your email to verify your account."
      });
    }

    const token = generateToken(user);
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "invalid or no token!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token
    });

  } catch (error) {
    console.log("error", error.message);

    return res.status(500).json({
      success: false,
      message: "internal server error please try later!",
    });
  }
};
