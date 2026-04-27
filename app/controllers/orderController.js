import SSLCommerzPayment from "sslcommerz-lts";
import dotenv from "dotenv";
import Cart from "../model/cartModel.js";
import Order from "../model/orderModel.js";
import User from "../model/userModel.js";
import Product from "../model/productModel.js"

dotenv.config();

const store_id = process.env.STORE_ID;
const store_password = process.env.STORE_PASSWORD;
const is_live = false;

export const paymentBkash = async (req, res) => {
  try {
    const { paymentId } = req.body;

    const cart = await Cart.findOne({ userId: paymentId });
    const user = await User.findById(paymentId);

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const order = await Order.create({
      userId: user._id,
      items: cart.items.map((item) => ({
        productId: item.productId,
        price: item.price,
        quantity: item.quantity,
      })),
      totalAmount: cart.totalPrice,
      shippingAddress: {
        address: user.address,
        city: user.city,
        postCode: user.postCode,
        phone: user.phone,
      },
      paymentMethod: "sslcommerz",
      paymentStatus: "pending",
    });

    const tran_id = order._id.toString();

    const data = {
      total_amount: cart.totalPrice,
      currency: "BDT",
      tran_id: tran_id,

      success_url: `https://e-commerce-backend-byuj.onrender.com/api/v1/order/payment-bkash/success/${tran_id}`,
      fail_url: `https://e-commerce-backend-byuj.onrender.com/api/v1/order/payment-bkash/fail/${tran_id}`,
      cancel_url: `https://e-commerce-backend-byuj.onrender.com/api/v1/order/payment-bkash/fail/${tran_id}`,

      ipn_url: "https://e-commerce-backend-byuj.onrender.com/ipn",

      shipping_method: "Courier",
      product_name: "Cart Items",
      product_category: "General",
      product_profile: "general",

      cus_name: user.firstName,
      cus_email: user.email,
      cus_add1: user.address,
      cus_city: user.city,
      cus_postcode: user.postCode,
      cus_country: "Bangladesh",
      cus_phone: user.phone,

      ship_name: user.firstName,
      ship_add1: user.address,
      ship_city: user.city,
      ship_postcode: user.postCode,
      ship_country: "Bangladesh",
    };

    const sslcz = new SSLCommerzPayment(store_id, store_password, is_live);

    sslcz.init(data).then((apiResponse) => {
      const GatewayPageURL = apiResponse.GatewayPageURL;
      return res.json({ success: true, url: GatewayPageURL });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const handleSuccess = async (req, res) => {
  try {
    const { tran_id } = req.params;

    const order = await Order.findById(tran_id);
    if (!order) return res.status(404).send("Order not found");

    order.paymentStatus = "paid";
    order.transactionId = tran_id;
    await order.save();

    await Cart.findOneAndDelete({ userId: order.userId });

    await User.findByIdAndUpdate(
      order.userId,
      { address: "", city: "", postCode: "", phone: "" },
      { new: true },
    );

    res.redirect(`https://e-commerce-frontend-9dce.onrender.com/success`);
  } catch (error) {
    console.log(error);
    res.status(500).send("Payment success error");
  }
};
export const handleFail = async (req, res) => {
  try {
    const { tran_id } = req.params;

    await Order.findByIdAndDelete(tran_id);

    res.redirect(`https://e-commerce-frontend-9dce.onrender.com/fail`);
  } catch (error) {
    console.log(error);
    res.status(500).send("Payment failed error");
  }
};

export const getMyOrders = async (req, res) => {
  const userId = req.headers.user_id;
  try {
    const orders = await Order.find({ userId: userId })
      .populate("items.productId", "productName productPrice productImg ")
      .populate("userId", "firstName lastName email");
    return res.status(200).json({
      success: true,
      message: "get my order successful",
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal get My order error",
      error: error.message,
    });
  }
};

export const showUserOrders = async (req, res) => {
  const id = req.params.id;

  try {
    const order = await Order.find({ userId: id })
      .populate("items.productId", "productName productPrice productImg")
      .populate("userId", "firstName lastName email");

    return res.status(200).json({
      success: true,
      message: "show user orders successful",
      count: order.length,
      order,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal show user orders error",
      error: error.message,
    });
  }
};

export const getAllOrdersAdmin = async (req, res) => {
  const adminId=req.headers.user_id;
  try {
    const admin=await User.findById(adminId);
    if(admin.role !=="admin"){
      return res.status(400).json({success:false,message:"Only admin get all orders",})
    }
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("items.productId", "productName productPrice productImg")
      .populate("userId", "firstName lastName email");
      return res.status(200).json({success:true,message:"get all orders",count:orders.length,
        orders
      })
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal get all orders error",
        error: error.message,
      });
  }
};


export const getSalesData = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({});
        const totalProducts = await Product.countDocuments({});
        const totalOrders = await Order.countDocuments({ paymentStatus: "paid" });

        const totalSaleAgg = await Order.aggregate([
            { $match: { paymentStatus: "paid" } }, 
            { 
                $group: { 
                    _id: null, 
                    total: { $sum: "$totalAmount" } 
                } 
            }
        ]);

        const totalSales = totalSaleAgg[0]?.total || 0;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const salesByDate = await Order.aggregate([
            { 
                $match: { 
                    paymentStatus: "paid", 
                    createdAt: { $gte: thirtyDaysAgo } 
                } 
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    amount: { $sum: "$totalAmount" }, 
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const formattedSales = salesByDate.map((item) => ({
            date: item._id,
            amount: item.amount
        }));

        res.json({
            success: true,
            totalUsers,
            totalProducts,
            totalOrders,
            totalSales,
            sales: formattedSales
        });

    } catch (error) {
        console.error("Error fetching sales data:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};