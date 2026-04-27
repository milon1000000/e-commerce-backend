import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
      profileImage: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    token: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
    isLoggedIn: { type: Boolean, default: false },
    otp:{type:String,default:null},
    otpExpiry:{type:Date,default:null},
    address:{type:String},
    city:{type:String},
    postCode:{type:String},
    phone:{type:String}
  },
  { timestamps: true, versionKey: false },
);

const User = mongoose.model("User", userSchema);
export default User;
