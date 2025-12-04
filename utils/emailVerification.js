// utils/emailVerification.js
const dotenv = require('dotenv');
const transporter = require('../config/email');
dotenv.config();

const sendVerification = async (email, verificationLink) => {
  const mailOption = {
    from: {
      name: "Granduer",
      address: process.env.EMAIL_HOST_USER,
    },
    to: email,
    subject: "Email Verification",
   html: `
      <div style="width: 100%; height:600px; max-width: 600px; margin: auto; text-align: center;
      font-family: Arial, sans-serif; border-radius: 10px; overflow: hidden;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="height: 300px;">
          <tr>
            <td style="background: url('https://res.cloudinary.com/dtjgj2odu/image/upload/v1739154208/logo_c6zxpk.png') 
            no-repeat center center; background-size: cover;"></td>
          </tr>
        </table>
        <div style="padding: 20px; color:  #0B0F29;">
          <p style="font-size: 16px;">Click the button below to verify your email. This link is valid for 1 hour.</p>
          <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background: #0B0F29; 
          border: 5px solid #0B0F29; color: #F20000; text-decoration: none; font-weight: bold; border-radius: 5px;"
          onmouseover="this.style.background='#FFF'; this.style.color='#0B0F29';"
          onmouseout="this.style.background='#0B0F29'; this.style.color='#F20000';">Verify Email</a>
          <p style="margin-top: 20px; font-size: 14px; color:  #0B0F29;">If you did not request this, please ignore this email.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOption);
  } catch (error) {
    console.error("Unable to send mail", error.message);
    throw error;
  }
};

module.exports = { sendVerification };
