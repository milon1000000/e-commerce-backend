import express from "express";
const userRouter = express.Router();
import {
  adminTocreateUser,
  allUsers,
  changePassword,
  createAddress,
  createNewAdmin,
  forgotPassword,
  getCurrentUser,
  getUserById,
  login,
  logout,
  register,
  reVerify,
  updateUser,
  userSearch,
  verify,
  verifyOTP,
} from "../app/controllers/userController.js";
import AuthMiddleware from "../app/middlewares/AuthMiddleware.js";
import upload from "../app/middlewares/multer.js";

// all api
userRouter.post("/register", register);
userRouter.put("/address",AuthMiddleware,createAddress);
userRouter.post("/verify", verify);
userRouter.post("/reverify", reVerify);
userRouter.post("/login", login);
userRouter.delete("/logout", logout);
userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/verify-otp/:email", verifyOTP);
userRouter.post("/change-password/:email", changePassword);
userRouter.get("/all-user", AuthMiddleware, allUsers);
userRouter.get("/get-user/:userId", AuthMiddleware, getUserById);
userRouter.get("/get-current", AuthMiddleware, getCurrentUser);
userRouter.post("/create-admin/:id",AuthMiddleware,createNewAdmin)
userRouter.post("/create-user/:id",AuthMiddleware,adminTocreateUser)

userRouter.put(
  "/update-user",
  AuthMiddleware,
  upload.single("profileImage"),
  updateUser,
);
userRouter.get("/userSearch",AuthMiddleware,userSearch)

export default userRouter;
