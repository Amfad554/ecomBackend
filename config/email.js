const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail", 
  host: "smtp.gmail.com",
  port: 465,            // Port 465 is more stable for local dev
  secure: true,         // Use true for port 465
  auth: {
    user: process.env.EMAIL_HOST_USER,
    pass: process.env.EMAIL_HOST_PASSWORD,
  },
  tls: {
    // This helps if your local network has strict security rules
    rejectUnauthorized: false 
  },
  connectionTimeout: 10000, // Wait 10 seconds before giving up
});

module.exports = transporter;