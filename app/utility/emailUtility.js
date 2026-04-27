import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendMail = (token, email) => {
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

    text: `Hi! There, You have recently visited our website and entered your email. Please follow the given link to verify your email https://e-commerce-frontend-9dce.onrender.com/verify/${token} Thanks`,
  };
  transporter.sendMail(mailConfigurations, (error, info) => {
    if (error) throw Error(error);
    console.log("Email sent Successfully");
    console.log(info);
  });
};
