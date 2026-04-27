import express from "express";
import AuthMiddleware from "../app/middlewares/AuthMiddleware.js";
import { addToCart, getCart, removeFromCart, updateQuantity } from "../app/controllers/cartController.js";
const cartRouter = express.Router();

// all api

cartRouter.get("/",AuthMiddleware,getCart);
cartRouter.post("/add",AuthMiddleware,addToCart);
cartRouter.put("/update",AuthMiddleware,updateQuantity);
cartRouter.delete("/remove",AuthMiddleware,removeFromCart);

export default cartRouter;
