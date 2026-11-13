import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendMail = async (otp, email) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailConfigurations = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Email Verification",
      text: `Your verify otp is ${otp}`,
    };

    const info = await transporter.sendMail(mailConfigurations);
    console.log("Email sent Successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending verification email:", error.message);
    throw error;
  }
};
