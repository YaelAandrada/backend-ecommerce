const express = require('express');
const router = express.Router();
const {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  logout
} = require('../controllers/authController');
const { validateRegister } = require('../middlewares/validation');
const { protect } = require('../middlewares/auth');

router.post('/register', validateRegister, register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/logout', protect, logout);

module.exports = router;
