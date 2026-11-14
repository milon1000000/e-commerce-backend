import multer from "multer";
import fs from "fs";
import path from "path";
import os from "os";

// On Vercel / serverless, filesystem is read-only except os.tmpdir()
const uploadPath = process.env.VERCEL
  ? path.join(os.tmpdir(), "ecommerce_uploads")
  : "./public";

if (!fs.existsSync(uploadPath)) {
  try {
    fs.mkdirSync(uploadPath, { recursive: true });
  } catch (err) {
    console.error("Multer upload directory creation warning:", err.message);
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

export default upload;
