const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/user');
const auth = require('../middleware/auth');

// Create new order
router.post('/', auth, async (req, res) => {
  try {
    console.log('Received order request:', req.body);
    
    // Get user information
    const user = await User.findById(req.user);
    if (!user) {
      console.log('User not found:', req.user);
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    console.log('Found user:', user);

    // Create order with user information
    const orderData = {
      items: req.body.items,
      totalAmount: req.body.totalAmount,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: user.phone || 'Not provided',
      userId: req.user,
      status: 'pending'
    };

    console.log('Creating order with data:', orderData);

    const order = new Order(orderData);
    await order.save();
    console.log('Order created successfully:', order);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error('Order creation error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get all orders
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Complete an order
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const orderId = req.params.id;
    console.log(`[DEBUG] Starting to complete order ${orderId}`);
    console.log(`[DEBUG] Current time: ${new Date().toISOString()}`);
    
    // First, check if the order exists
    const existingOrder = await Order.findById(orderId);
    console.log(`[DEBUG] Existing order: ${existingOrder ? 'Found' : 'Not found'}`);
    if (existingOrder) {
      console.log(`[DEBUG] Current status: ${existingOrder.status}`);
    }
    
    if (!existingOrder) {
      console.log(`[DEBUG] Order ${orderId} not found`);
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    // Update using findByIdAndUpdate
    console.log(`[DEBUG] Updating order ${orderId} status to 'completed'`);
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status: 'completed' },
      { new: true }
    );
    
    console.log(`[DEBUG] Updated order: ${updatedOrder ? 'Success' : 'Failed'}`);
    if (updatedOrder) {
      console.log(`[DEBUG] New status: ${updatedOrder.status}`);
    }
    
    // Double-check the update
    const verifyOrder = await Order.findById(orderId);
    console.log(`[DEBUG] Verification - order status: ${verifyOrder ? verifyOrder.status : 'Order not found'}`);
    
    // Respond with the updated order
    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    console.error(`[DEBUG] Error completing order:`, error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Clear all orders
router.delete('/clear', auth, async (req, res) => {
  try {
    await Order.deleteMany({});
    res.json({ success: true, message: 'All orders cleared' });
  } catch (error) {
    console.error('Error clearing orders:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Direct update endpoint for testing (NO AUTH REQUIRED)
router.get('/test-complete/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    console.log(`[TEST] Attempting to complete order ${orderId}`);
    
    // Get the current order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Update the status
    order.status = 'completed';
    await order.save();
    
    console.log(`[TEST] Updated order status to: ${order.status}`);
    
    return res.json({ 
      success: true, 
      message: 'Order marked as completed via test endpoint',
      order
    });
  } catch (error) {
    console.error('[TEST] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router; 