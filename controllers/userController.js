const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const generateToken = require("../utils/generateToken");
const { v4: uuidv4 } = require('uuid');

// --- REGISTRATION ---
exports.registerUser = async (req, res) => {
  const { firstname, lastname, email, password, confirmpassword, phone, address } = req.body;

  try {
    if (!firstname || !lastname || !email || !password || !confirmpassword) {
      return res.status(400).json({ success: false, message: "Missing required fields!" });
    }

    if (password !== confirmpassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match!" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, "image", "Users");
    }

    const newUser = await prisma.user.create({
      data: {
        firstname,
        lastname,
        email,
        password: hashedPassword,
        phone,
        address,
        image: imageUrl,
        uuid: uuidv4(),
        role: "USER",
        isVerified: true, // ✅ auto-verify since no email service
      }
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful!",
      data: { id: newUser.id, firstname: newUser.firstname, lastname: newUser.lastname }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- LOGIN ---
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ success: false, message: "Invalid email or password" });
    }
    if (!user.isVerified) {
      const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY, { expiresIn: '15m' });
      const verificationLink = `https://granduer.vercel.app/verifyemail/${token}`;
      await sendVerification(user.email, verificationLink);
      return res.status(403).json({ success: false, message: "Account not verified. New link sent." });
    }

    const token = generateToken(user);
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error during login" });
  }
};

// --- EMAIL VERIFICATION ---
exports.verifyEmail = async (req, res) => {
  const token = req.body.token || req.params.token || req.query.token;
  try {
    if (!token) return res.status(400).json({ success: false, message: "Token is required!" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    await prisma.user.update({
      where: { email: decoded.email },
      data: { isVerified: true }
    });
    return res.status(200).json({ success: true, message: "Email verified!" });
  } catch (error) {
    return res.status(400).json({ success: false, message: "Invalid or expired token" });
  }
};

// --- GET ALL USERS ---
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: "USER" },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        role: true,
        isVerified: true
      }
    });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};

// --- UPDATE ROLE ---
exports.updateRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  try {
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: { role },
    });
    return res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- DELETE USER ---
exports.deleteUser = async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: Number(req.params.id) }
    });
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};

// --- UPDATE PROFILE ---
exports.updateProfile = async (req, res) => {
  const { id } = req.params;
  const { firstname, lastname, email, newPass } = req.body;
  try {
    const updateData = { firstname, lastname, email };
    if (newPass && newPass.trim() !== "") {
      const salt = await bcrypt.genSalt(12);
      updateData.password = await bcrypt.hash(newPass, salt);
    }
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: updateData,
      select: {
        id: true,
        firstname: true,
        lastname: true,
        email: true,
        role: true
      }
    });
    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ success: false, message: "Update failed" });
  }
};

// userController.js
exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }, // req.user set by your auth middleware
      select: { id: true, firstname: true, lastname: true, email: true, role: true, isVerified: true }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists" });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};