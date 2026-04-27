import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendOtp = async(otp,email) => {
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
    subject: "Password Reset OTP",
    html:`<p>Your OTP for password reset is:<b>${otp}</b></p>`
    
  };
  transporter.sendMail(mailConfigurations, (error, info) => {
  if (error) throw Error(error)
  console.log("OTP sent Successfully");
  console.log(info)
});
};


