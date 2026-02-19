const User = require('../models/User');
const Wishlist = require('../models/Wishlist');
const { sendEmail } = require('../utils/emailService');
const crypto = require('crypto');

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Verificar si el usuario ya existe
    
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
           message: existingUser.email === email 
          ? 'El email ya está registrado' 
          : 'El nombre de usuario ya está en uso'
      });
    }

      
    // Crear usuario
    
    const user = await User.create({
      username,
      email,
      password
    });

      // Crear lista de deseos vacía
    
      await Wishlist.create({
      user: user._id,
      items: []
    });

