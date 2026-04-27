// import { JWT_EXPIRE_TIME, JWT_KEY } from "../config/config.js";
// import jwt from "jsonwebtoken";

// export const TokenEncode = async(email, user_id,role) => {
//   const KEY = JWT_KEY;
//   const EXPIRE = { expiresIn: JWT_EXPIRE_TIME };
//   const PAYLOAD = { email: email, user_id: user_id,role:role };
//   return jwt.sign(PAYLOAD, KEY, EXPIRE);
// };

// export const TokenDecode = (token) => {
//   try {
//     return jwt.verify(token, JWT_KEY);
//   } catch (e) {
//     return null;
//   }
// };


import jwt from "jsonwebtoken";
import { JWT_KEY, JWT_EXPIRE_TIME } from "../config/config.js";

// Encode Token
export const TokenEncode = (email, user_id, role, expireTime) => {

  const payload = {
    email: email,
    user_id: user_id,
    role: role,
  };

  return jwt.sign(payload, JWT_KEY, {
    expiresIn: expireTime || JWT_EXPIRE_TIME,
  });
};

// Decode Token
export const TokenDecode = (token) => {
  try {
    return jwt.verify(token, JWT_KEY);
  } catch (error) {
    return null;
  }
};