const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const { sendVerification } = require("../utils/emailVerification");
const generateToken = require("../utils/generateToken");

// --- REGISTRATION ---
exports.registerUser = async (req, res) => {
  const { name, email, password, confirmpassword } = req.body;
  try {
    if (!name || !email || !password || !confirmpassword) {
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
      data: { name, email, password: hashedPassword, image: imageUrl, role: "CLIENT", isVerified: false }
    });

    const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY, { expiresIn: '15m' });
    const verificationLink = `http://localhost:5173/verifyemail/${token}`;
    await sendVerification(newUser.email, verificationLink);

    return res.status(201).json({
      success: true,
      message: "Registration successful! Check email to verify.",
      data: { id: newUser.id, name: newUser.name }
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
      const link = `http://localhost:5173/verifyemail/${token}`;
      await sendVerification(user.email, link);
      return res.status(403).json({ success: false, message: "Account not verified. New link sent." });
    }

    const token = generateToken(user);
    res.status(200).json({
      success: true,
      token,
      user: { id: user.id, name: user.name, role: user.role, email: user.email }
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

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: "CLIENT" }, // This ensures staff/admins are never even sent
      select: { id: true, name: true, email: true, role: true, isVerified: true }
    });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};

// --- DELETE USER ---
exports.deleteUser = async (req, res) => {
  try {
    await prisma.user.delete({ 
      where: { id: req.params.id } // No parseInt needed
    });
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};
// --- UPDATE ROLE ---
exports.updateRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    console.log("1. Starting DB Update...");
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: { role: role },
    });
    
    console.log("2. DB Update Finished!"); // If you don't see this, Prisma is hanging.

    return res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("❌ DB Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// --- UPDATE PROFILE ---
exports.updateProfile = async (req, res) => {
  const { id } = req.params;
  const { name, email, newPass } = req.body;

  try {
    const updateData = { name, email };
    if (newPass && newPass.trim() !== "") {
      const salt = await bcrypt.genSalt(12);
      updateData.password = await bcrypt.hash(newPass, salt);
    }

    const updatedUser = await prisma.user.update({
      where: { 
        id: id // <--- REMOVED parseInt() here too
      },
      data: updateData,
      select: { id: true, name: true, email: true, role: true }
    });

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Profile Update Error:", error);
    res.status(500).json({ success: false, message: "Update failed" });
  }
};