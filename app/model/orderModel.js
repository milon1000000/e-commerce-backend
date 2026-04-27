import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        name: String,        
        price: Number,       
        quantity: Number,
        image: String,       
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    shippingAddress: {
      address: String,
      city: String,
      postCode: String,
      phone: String,
    },

    paymentMethod: {
      type: String,
      enum: ["bkash", "sslcommerz", "cod"],
      default: "sslcommerz",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled"],
      default: "processing",
    },

    transactionId: {
      type: String, 
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;