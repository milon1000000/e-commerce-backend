import Cart from "../model/cartModel.js";
import Product from "../model/productModel.js";

export const getCart = async (req, res) => {
  try {
    const userId = req.headers.user_id;
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart) {
      return res.status(200).json({ success: true, cart: { items: [], totalPrice: 0 } });
    }
    return res.status(200).json({ success: true, cart });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal get cart error",
      error: error.message,
    });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.headers.user_id;
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({
        userId,
        items: [{ productId, quantity: 1, price: product.productPrice }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += 1;
      } else {
        cart.items.push({ productId, quantity: 1, price: product.productPrice });
      }
    }

    cart.totalPrice = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate("items.productId");

    return res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      cart: populatedCart,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal add to cart error",
      error: error.message,
    });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const userId = req.headers.user_id;
    const { productId, type } = req.body;

    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (!["increase", "decrease"].includes(type))
      return res.status(400).json({ success: false, message: "Invalid type" });

    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const item = cart.items.find((i) => i.productId.toString() === productId);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    if (type === "increase") item.quantity += 1;
    if (type === "decrease") {
      item.quantity -= 1;
      if (item.quantity <= 0) {
        cart.items = cart.items.filter((i) => i.productId.toString() !== productId);
      }
    }

    cart.totalPrice = cart.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
    await cart.save();
    await cart.populate("items.productId");

    return res.status(200).json({ success: true, cart });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal update quantity error",
      error: error.message,
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.headers.user_id;
    const { productId } = req.body;

    if (!userId || !productId)
      return res.status(400).json({ success: false, message: "Invalid data" });

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    cart.items = cart.items.filter((item) => item.productId.toString() !== productId.toString());
    cart.totalPrice = cart.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    await cart.save();
    await cart.populate("items.productId");

    return res.status(200).json({ success: true, cart });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal remove from cart error",
      error: error.message,
    });
  }
};