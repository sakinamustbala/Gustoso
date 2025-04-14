const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const auth = require('../middleware/auth');

// Create new reservation
router.post('/', auth, async (req, res) => {
  try {
    console.log('Received reservation request:', req.body);
    
    const reservationData = {
      ...req.body,
      userId: req.user
    };

    const reservation = new Reservation(reservationData);
    await reservation.save();
    
    res.status(201).json({ 
      success: true, 
      data: reservation,
      message: 'Reservation created successfully' 
    });
  } catch (error) {
    console.error('Reservation creation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Server error' 
    });
  }
});

// Get all reservations (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');
    
    res.json({ 
      success: true, 
      data: reservations 
    });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
});

// Update reservation status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!reservation) {
      return res.status(404).json({ 
        success: false, 
        error: 'Reservation not found' 
      });
    }

    res.json({ 
      success: true, 
      data: reservation 
    });
  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
});

// Clear all reservations
router.delete('/clear', auth, async (req, res) => {
  try {
    const result = await Reservation.deleteMany({});
    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'No reservations found to clear' 
      });
    }
    res.json({ 
      success: true, 
      message: `Successfully cleared ${result.deletedCount} reservations` 
    });
  } catch (error) {
    console.error('Error clearing reservations:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error while clearing reservations' 
    });
  }
});

module.exports = router; 