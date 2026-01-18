const router = require('express').Router();
const User = require('../models/User');

// 1. GET USER PROFILE (View details)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json("User not found");
    
    // Don't send the password back!
    const { password, ...otherDetails } = user._doc;
    res.status(200).json(otherDetails);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. UPDATE USER PROFILE
router.put('/:id', async (req, res) => {
  try {
    // Ideally, we should check if the current user matches the ID (Authorization)
    // For this task, we will allow the update directly.
    
    const updatedUser = await User.findByIdAndUpdate(req.params.id, {
      $set: req.body, // Update whatever fields are sent (bio, username, etc.)
    }, { new: true }); // "new: true" returns the updated version, not the old one

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;