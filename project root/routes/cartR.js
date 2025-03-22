const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Product = require('../models/product');

// ➡️ Add to Cart
router.post('/add', async (req, res) => {
  const { productId } = req.body;

  try {
    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Check if the product is already in the cart
    let cartItem = await Cart.findOne({ productId });
    if (cartItem) {
      cartItem.quantity += 1;
    } else {
      cartItem = new Cart({ productId, quantity: 1 });
    }

    await cartItem.save();
    res.status(200).json(cartItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➡️ Get Cart Items
router.get('/', async (req, res) => {
  try {
    const cartItems = await Cart.find().populate('productId');
    res.status(200).json(cartItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ➡️ Remove from Cart
router.delete('/remove/:id', async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;