import userModel from "../model/userModel.js";
import bcrypt from "bcrypt";
import { TokenDecode, TokenEncode } from "../utility/tokenUtility.js";
import { sendMail } from "../utility/emailUtility.js";
import { sendOtp } from "../utility/sentOtp.js";
import {emailUtility} from "../utility/emailUtility.js"
import { v2 as cloudinary } from "cloudinary";
import uploadOnCloudinary from "../config/cloudinary.js";

// signup
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({
          message: "Password must be at least 8 characters",
          success: false,
        });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already exists", success: false });
    }

    // password hash
    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
      firstName,
      lastName,
      email,
      password: hashPassword,
    });

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    newUser.otp = otp;
    newUser.otpExpiry = otpExpiry;
    await newUser.save();

    await emailUtility(otp, email);

    return res.status(201).json({
      success: true,
      message: "User created successfully. OTP sent to your email.",
      userId: newUser._id,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Registration error",
      error: error.message,
    });
  }
};

// verify controller
export const verify = async (req, res) => {
  const { email, otp } = req.body;

  const user = await userModel.findOne({ email });
  if (!user)
    return res.status(400).json({ message: "User not found", success: false });

  if (otp != user.otp) {
    return res.status(400).json({
      success: false,
      message: "OTP Invalid",
    });
  }

  if (user.otpExpiry < new Date())
    return res.status(400).json({ message: "OTP expired", success: false });

  user.otp = null;
  user.otpExpiry = null;
  user.isVerified = true;
  await user.save();

  return res
    .status(200)
    .json({ success: true, message: "Email verified successfully" });
};

// reVerify

export const reVerify = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "user not found" });
    }

    const token = await TokenEncode(user.email, user._id);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "none",
      secure: true,
    });

    await sendMail(token, email);

    user.token = token;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Verification email sent again successfully",
      token: user.token,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal reverify error",
      error: error.message,
    });
  }
};

// login controller

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ message: "email is required", success: false });
    }
    if (!password) {
      return res
        .status(400)
        .json({ message: "password is required", success: false });
    }

    let user = await userModel.findOne({ email: email.trim() });
    if (!user) {
      return res
        .status(400)
        .json({ message: "user not exist !", success: false });
    }

    if (user.isVerified === false) {
      return res
        .status(400)
        .json({ message: "Please verify fast", success: false });
    }

    // Match password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "incorrect password", success: false });
    }

    const token = TokenEncode(user.email, user._id, user.role);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: "none",
      secure: true,
    });

    user.isLoggedIn = true;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "login successful", user, token });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Internal login error", error: error.message });
  }
};

// logout controller

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    return res
      .status(200)
      .json({ message: "logout successful", success: true });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "logout error", error: error.message, success: false });
  }
};

// forgotpassword

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;

    await user.save();
    await sendOtp(otp, email);

    return res.status(200).json({
      success: true,
      message: "OTP sent to email successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal forgot-password error",
      error: error.message,
    });
  }
};
// verifyOTP
export const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const { email } = req.params;

    if (!otp) {
      return res
        .status(400)
        .json({ success: false, message: "OTP is required" });
    }

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    //First check OTP exists
    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: "OTP not generated or already verified",
      });
    }

    // Expiry check
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired Please request new one",
      });
    }

    // Compare OTP (safe way)
    if (otp != user.otp) {
      return res.status(400).json({
        success: false,
        message: "OTP Invalid",
      });
    }

    // Clear OTP after success
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return res.status(200).json({
      message: "Verify OTP successful",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal verify error",
      error: error.message,
      success: false,
    });
  }
};
// change Password
export const changePassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    if (!newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "new password is required" });
    }
    if (!confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "confirm password password is required",
      });
    }
    const { email } = req.params;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "user not found" });
    }
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Password do not match" });
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashPassword;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "change password successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal change password error",
      error: error.message,
      success: false,
    });
  }
};

export const allUsers = async (req, res) => {
  const role = req.headers.role;

  try {
    if (role !== "admin") {
      return res
        .status(400)
        .json({ success: false, message: "Only admin access get all users" });
    }
    const users = await userModel.find();
    return res
      .status(200)
      .json({ success: true, message: "get all users successfully", users });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal all user error",
      error: error.message,
    });
  }
};

export const getUserById = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "user not found" });
    }

    return res.status(200).json({ success: true, message: "get user", user });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getCurrentUser = async (req, res) => {
  const id = req.headers.user_id;
  console.log(id);
  try {
    const user = await userModel.findById(id);
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "get current user successfully", user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal get profile error",
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  const id = req.headers.user_id;

  try {
    const existUser = await userModel.findById(id);

    if (!existUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { firstName, lastName, phone, address, city, zipCode } = req.body;

    let profileImage = existUser.profileImage;

    if (req.file) {
      if (existUser?.profileImage?.public_id) {
        try {
          await cloudinary.uploader.destroy(existUser.profileImage.public_id);
          console.log("Old image deleted from Cloudinary");
        } catch (err) {
          console.log("Cloudinary delete error:", err.message);
        }
      }

      const uploadedImage = await uploadOnCloudinary(
        req.file.path,
        "updateProfileImage",
      );

      profileImage = uploadedImage;
    }

    const user = await userModel
      .findByIdAndUpdate(
        id,
        {
          firstName,
          lastName,
          phone,
          address,
          city,
          zipCode,
          profileImage,
        },
        { new: true },
      )
      .select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.log("Update user error:", error);

    return res.status(500).json({
      success: false,
      message: "Update profile failed",
      error: error.message,
    });
  }
};

export const userSearch = async (req, res) => {
  try {
    const { search } = req.query;
    const role = req.headers.role;

    console.log(role);

    if (role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can search users",
      });
    }

    if (!search) {
      return res.status(400).json({
        message: "query is required",
        success: false,
      });
    }

    const conditions = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];

    if (!isNaN(search)) {
      conditions.push({ phone: Number(search) });
    }

    const users = await userModel.find({ $or: conditions });

    return res.status(200).json({
      message: "search users successfully",
      users,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal search user error",
      error: error.message,
      success: false,
    });
  }
};

export const createNewAdmin = async (req, res) => {
  try {
    const adminId = req.headers.user_id;
    const admin = await userModel.findById(adminId);
    if (!admin) {
      return res
        .status(400)
        .json({ success: false, message: "Admin not found" });
    }
    if (admin.role !== "admin") {
      return res
        .status(400)
        .json({ success: false, message: "Only admin create new admin" });
    }
    const userId = req.params.id;
    const newAdmin = await userModel.findByIdAndUpdate(
      userId,
      { role: "admin" },
      { new: true },
    );
    return res
      .status(200)
      .json({
        success: true,
        message: "New admin create successfully",
        newAdmin,
      });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal create admin error",
        error: error.message,
      });
  }
};

export const adminTocreateUser = async (req, res) => {
  try {
    const adminId = req.headers.user_id;
    const admin = await userModel.findById(adminId);
    if (!admin) {
      return res
        .status(400)
        .json({ success: false, message: "Admin not found" });
    }
    if (admin.role !== "admin") {
      return res
        .status(400)
        .json({ success: false, message: "Only admin create new admin" });
    }
    const userId = req.params.id;
    const user = await userModel.findByIdAndUpdate(
      userId,
      { role: "user" },
      { new: true },
    );
    return res
      .status(200)
      .json({ success: true, message: "create user successfully", user });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal create admin error",
        error: error.message,
      });
  }
};

export const createAddress = async (req, res) => {
  try {
    const userId = req.headers.user_id;

    if(!userId){
      return res.status(400).json({success:false,message:"User ID is required"})
    }

    const { address, city, postCode, phone } = req.body;

    if(!address){
      return res.status(400).json({success:false,message:"Address is required"})
    }
    if(!city){
      return res.status(400).json({success:false,message:"City is required"})
    }
    if(!phone){
      return res.status(400).json({success:false,message:"Phone is required"})
    }
    if(!postCode){
      return res.status(400).json({success:false,message:"Post code is required"})
    }

    const createAddress = await userModel.findByIdAndUpdate(
      userId,
      { address, city, postCode, phone },
      { new: true }
    );

    if(!createAddress){
      return res.status(404).json({success:false,message:"User not found"})
    }

    return res.status(200).json({
      success:true,
      message:"Address created successfully",
      createAddress
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal address error",
      error: error.message,
    });
  }
};
