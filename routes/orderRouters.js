import express from "express";
import AuthMiddleware from "../app/middlewares/AuthMiddleware.js";
import { getAllOrdersAdmin, getMyOrders, getSalesData, handleFail, handleSuccess, paymentBkash, showUserOrders } from "../app/controllers/orderController.js";

const orderRoute = express.Router();

// all api
orderRoute.post("/payment-bkash",AuthMiddleware, paymentBkash);
orderRoute.post("/payment-bkash/success/:tran_id",handleSuccess);
orderRoute.post("/payment-bkash/fail/:tran_id", handleFail);
orderRoute.get("/get-order",AuthMiddleware,getMyOrders);
orderRoute.get("/showUserOrders/:id",AuthMiddleware,showUserOrders)
orderRoute.get("/get-all-orders",AuthMiddleware,getAllOrdersAdmin);
orderRoute.get("/salesData",AuthMiddleware,getSalesData)

export default orderRoute;
