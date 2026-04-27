import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendMail = (otp, email) => {
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

    text: `Your verify otp is ${otp} Thanks`,
  };
  transporter.sendMail(mailConfigurations, (error, info) => {
    if (error) throw Error(error);
    console.log("Email sent Successfully");
    console.log(info);
  });
};
