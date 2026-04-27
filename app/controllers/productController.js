import uploadOnCloudinary from "../config/cloudinary.js";
import Product from "../model/productModel.js";
import User from "../model/userModel.js";
import { v2 as cloudinary } from "cloudinary";

export const addProduct = async (req, res) => {
  try {
    const userId = req.headers.user_id;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "User ID missing" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Only admin can add product" });
    }

    const { productName, productDes, productPrice, category, brand } = req.body;

    const productPriceNumber = Number(productPrice);
    if (isNaN(productPriceNumber)) {
      return res
        .status(400)
        .json({ success: false, message: "Price must be a number" });
    }

    let productImg = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadOnCloudinary(
          file.path,
          "ecommerce-products",
        );
        productImg.push(result);
      }
    }

    if (!productImg || productImg.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Product images are required" });
    }

    const product = await Product.create({
      productName,
      productDes,
      productPrice: productPriceNumber,
      category,
      brand,
      userId,
      productImg,
    });

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    console.error("Add Product Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getAllProduct = async (req, res) => {
  try {
    const products = await Product.find();
    if (!products) {
      return res.status(400).json({
        success: false,
        message: "No product available",
        products: [],
      });
    }
    return res.status(200).json({
      success: true,
      message: "get all products successfully",
      products,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal get all products error",
      error: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  const productId = req.params.productId;
  const userId = req.headers.user_id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can delete product",
      });
    }

    // 🔹 Product find korte hobe
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Cloudinary image delete
    if (product.productImg && product.productImg.length > 0) {
      for (const img of product.productImg) {
        if (img.public_id) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }
    }

    // MongoDB product delete
    await Product.findByIdAndDelete(productId);

    return res.status(200).json({
      success: true,
      message: "Product and images deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal delete product error",
      error: error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  const userId = req.headers.user_id;
  const productId = req.params.productId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can update product",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const { productName, productDes, productPrice, category, brand } = req.body;

    let productImg = product.productImg;

    if (req.files && req.files.length > 0) {
      if (product.productImg && product.productImg.length > 0) {
        for (const img of product.productImg) {
          if (img.public_id) {
            await cloudinary.uploader.destroy(img.public_id);
          }
        }
      }

      productImg = [];

      for (const file of req.files) {
        const result = await uploadOnCloudinary(
          file.path,
          "ecommerce-products",
        );

        productImg.push(result);
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        productName,
        productDes,
        productPrice,
        category,
        brand,
        productImg,
      },
      { new: true },
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal update product error",
      error: error.message,
    });
  }
};

export const search = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search) {
      return res.status(400).json({
        message: "query is required",
        success: false,
      });
    }

    const conditions = [
      { productName: { $regex: search, $options: "i" } },
      { productDes: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
    ];

    if (!isNaN(search)) {
      conditions.push({ productPrice: Number(search) });
    }

    const products = await Product.find({ $or: conditions });
    return res.status(200).json({
      message: "search product successfully",
      products,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal search product error",
      error: error.message,
      success: false,
    });
  }
};
