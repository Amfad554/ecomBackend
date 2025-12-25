// utils/emailVerification.js
const dotenv = require('dotenv');
const transporter = require('../config/email');
dotenv.config();

const sendVerification = async (email, verificationLink) => {
  const mailOption = {
    from: {
      name: "Crystal Ices Portal", // Updated Branding
      address: process.env.EMAIL_HOST_USER,
    },
    to: email,
    subject: "Verify Your Account - Crystal Ices",
    html: `
      <div style="width: 100%; max-width: 600px; margin: auto; text-align: center; font-family: 'Segoe UI', Arial, sans-serif; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #0B2A4A; padding: 40px 20px;">
          <div style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; border-radius: 10px; font-weight: bold; font-size: 24px;">CI</div>
          <h1 style="color: #ffffff; margin-top: 20px; font-size: 22px; text-transform: uppercase; letter-spacing: 2px;">Industrial Portal</h1>
        </div>

        <div style="padding: 40px 30px; color: #1e293b;">
          <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 10px;">Confirm your email address</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #64748b;">
            Thank you for registering with Crystal Ices. To complete your account setup and access the equipment fleet, please verify your email.
          </p>
          
          <div style="margin: 35px 0;">
            <a href="${verificationLink}" style="display: inline-block; padding: 16px 36px; background-color: #0B2A4A; color: #ffffff; text-decoration: none; font-weight: bold; border-radius: 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              Verify My Account
            </a>
          </div>

          <p style="font-size: 12px; color: #94a3b8; margin-top: 30px;">
            This link is valid for 15 minutes. If you did not create an account, you can safely ignore this email.
          </p>
        </div>

        <div style="background-color: #f8fafc; padding: 20px; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 10px; color: #94a3b8; margin: 0;">&copy; ${new Date().getFullYear()} Crystal Ices Energies Nigeria Limited.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOption);
    console.log(`Verification email successfully sent to ${email}`);
  } catch (error) {
    console.error("Nodemailer Error:", error.message);
    throw new Error("Unable to send verification email");
  }
};

module.exports = { sendVerification };