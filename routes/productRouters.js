import express from "express";
const productRoute = express.Router();

import AuthMiddleware from "../app/middlewares/AuthMiddleware.js";
import { addProduct, deleteProduct, getAllProduct, search, updateProduct } from "../app/controllers/productController.js";
import upload from "../app/middlewares/multer.js";

productRoute.post(
  "/add-product",
  AuthMiddleware,
  upload.array("productImg",5), 
  addProduct
);

productRoute.get("/getAllProduct",getAllProduct);
productRoute.delete("/delete-product/:productId",AuthMiddleware,deleteProduct);
productRoute.put("/update-product/:productId",AuthMiddleware,upload.array("productImg",5),updateProduct)
productRoute.get("/search-product",AuthMiddleware,search)

export default productRoute;