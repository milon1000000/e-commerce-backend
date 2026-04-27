import { TokenDecode } from "../utility/tokenUtility.js";

const AuthMiddleware = (req, res, next) => {
  try {
    const token = req.cookies["token"];

    // Token check
    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "You are not authorized. Please log in first.",
      });
    }

    const decoded = TokenDecode(token);

    // Decode check
    if (!decoded) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid or expired token. Please login again.",
      });
    }

    // Header set (je structure e tumi comfortable)
    req.headers.email = decoded.email;
    req.headers.user_id = decoded.user_id;
    req.headers.role = decoded.role;

    next();
  } catch (error) {
    return res.status(401).json({
      status: "fail",
      message: "Authentication failed. Please login again.",
    });
  }
};

export default AuthMiddleware;
