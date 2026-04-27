import multer from "multer";
import fs from "fs";
import path from "path";

const uploadPath = "./public";

if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

export default upload;
