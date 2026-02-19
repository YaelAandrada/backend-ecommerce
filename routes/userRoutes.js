const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  changePassword,
  getUserStats,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  updateWishlistNotification,
  shareWishlist,
  getUserReviews,
  getRecentActivity
} = require('../controllers/userController');
const { protect } = require('../middlewares/auth');
const { validateProfileUpdate } = require('../middlewares/validation');
const { upload, handleUploadError } = require('../middlewares/upload');


//Autenticación de las Rutas

router.use(protect);

//Perfil

router.get('/profile', getProfile);
router.put('/profile', validateProfileUpdate, updateProfile);

router.post('/avatar', upload.single('avatar'), handleUploadError, uploadAvatar);
router.delete('/avatar', deleteAvatar);

//Contraseña

router.put('/password', changePassword);

router.get('/stats', getUserStats);
router.get('/activity', getRecentActivity);

//Lista de deseos

router.get('/wishlist', getWishlist);
router.post('/wishlist/:gameId', addToWishlist);
router.delete('/wishlist/:gameId', removeFromWishlist);
router.put('/wishlist/:gameId/notify', updateWishlistNotification);
router.post('/wishlist/share', shareWishlist);

// Reseñas

router.get('/reviews', getUserReviews);

module.exports = router;
