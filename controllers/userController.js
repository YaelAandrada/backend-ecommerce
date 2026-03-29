const User = require('/models/User');
const Review = require('../models/Review');
const Wishlist = require('../models/Wishlist');
const Game = require('../models/Game.js');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const { sendEmail } = require('../utils/email');
const crypto = require('crypto');


exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
    .select('-resetPasswordToken -resetPasswordExpire -emailVerificationToken')
      .populate({
        path: 'wishlist',
        populate: {
          path: 'items.game',
          select: 'name price image category stats.averageRating'
        }
      })
      .populate({
        path: 'reviews',
        options: { 
          sort: { createdAt: -1 },
          limit: 5
        },
        populate: {
          path: 'game',
          select: 'name image'
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

   //Ultima actividad

     await user.updateLastActive();

     res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};


//Actualizacion del perfil usuario

exports.updateProfile = async (req, res, next) => {
  try {
    const { username, email, bio, settings } = req.body;
    
    
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }
    }

     
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El nombre de usuario ya está en uso'
        });
      }
    }

        const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (bio !== undefined) updateData.bio = bio;
    if (settings) updateData.settings = { ...req.user.settings, ...settings };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-resetPasswordToken -resetPasswordExpire -emailVerificationToken');

    res.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

//Avatar del usuario

exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, selecciona una imagen'
      });
    }

    const user = await User.findById(req.user.id);

    if (user.avatarPublicId) {
      await deleteFromCloudinary(user.avatarPublicId);
    }

     const result = await uploadToCloudinary(req.file.path, {
      folder: 'gamers/avatars',
      width: 300,
      height: 300,
      crop: 'fill'
    });
      user.avatar = result.secure_url;
    user.avatarPublicId = result.public_id;
    await user.save();

    res.json({
      success: true,
      message: 'Avatar actualizado correctamente',
      data: { avatar: user.avatar }
    });
  } catch (error) {
    next(error);
  }
};
exports.deleteAvatar = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.avatarPublicId) {
      await deleteFromCloudinary(user.avatarPublicId);
    }

    user.avatar = 'https://res.cloudinary.com/tu-cloud/image/upload/v1/default-avatar.png';
    user.avatarPublicId = null;
    await user.save();

    res.json({
      success: true,
      message: 'Avatar eliminado correctamente',
      data: { avatar: user.avatar }
    });
  } catch (error) {
    next(error);
  }
};

// Contraseña

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validar entrada

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, proporciona la contraseña actual y la nueva'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

     const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'La contraseña actual es incorrecta'
      });
    }

     user.password = newPassword;
    await user.save();

     await sendEmail({
      to: user.email,
      subject: 'Contraseña actualizada - GamerStore',
      html: `
        <h1>Contraseña Actualizada</h1>
        <p>Hola ${user.username},</p>
        <p>Tu contraseña ha sido actualizada correctamente.</p>
        <p>Si no realizaste este cambio, por favor contacta a soporte inmediatamente.</p>
      `
    });

    res.json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    next(error);
  }
};

//Informacion del usuario

exports.getUserStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Obtener estadísticas en paralelo
    const [
      reviewsCount,
      wishlistCount,
      averageRating,
      recentActivity
    ] = await Promise.all([
      Review.countDocuments({ user: userId }),
      Wishlist.aggregate([
        { $match: { user: userId } },
        { $project: { count: { $size: '$items' } } }
      ]),
      Review.aggregate([
        { $match: { user: userId } },
        { $group: { _id: null, avg: { $avg: '$rating' } } }
      ]),
      Review.find({ user: userId })
        .sort('-createdAt')
        .limit(5)
        .populate('game', 'name image')
    ]);

    res.json({
      success: true,
      data: {
        reviews: reviewsCount,
        wishlist: wishlistCount[0]?.count || 0,
        averageRating: averageRating[0]?.avg || 0,
        memberSince: req.user.createdAt,
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener lista de deseos del usuario
// @route   GET /api/users/wishlist
// @access  Private
exports.getWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate({
        path: 'items.game',
        select: 'name price image category developer stats.averageRating description'
      });

    if (!wishlist) {
      return res.json({
        success: true,
        data: { items: [] }
      });
    }

    res.json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    next(error);
  }
};

//Agregar juego a la whislist

exports.addToWishlist = async (req, res, next) => {
  try {
    const { gameId } = req.params;

    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: 'Juego no encontrado'
      });
    }

     let wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user.id, items: [] });
    }


      const exists = wishlist.items.some(
      item => item.game.toString() === gameId
    );

    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'El juego ya está en tu lista de deseos'
      });
    }

     wishlist.items.push({
      game: gameId,
      price: game.price,
      addedAt: new Date()
    });

    await wishlist.save();

     game.stats.totalWishlist = (game.stats.totalWishlist || 0) + 1;
    await game.save();


      await wishlist.populate('items.game', 'name price image category');

    res.json({
      success: true,
      message: 'Juego agregado a tu lista de deseos',
      data: wishlist
    });
  } catch (error) {
    next(error);
  }
};

exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { gameId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Lista de deseos no encontrada'
      });
    }

    const itemExists = wishlist.items.some(
      item => item.game.toString() === gameId
    );

    if (!itemExists) {
      return res.status(404).json({
        success: false,
        message: 'El juego no está en tu lista de deseos'
      });
    }

       wishlist.items = wishlist.items.filter(
      item => item.game.toString() !== gameId
    );

    await wishlist.save();

    await Game.findByIdAndUpdate(gameId, {
      $inc: { 'stats.totalWishlist': -1 }
    });

    res.json({
      success: true,
      message: 'Juego eliminado de tu lista de deseos'
    });
  } catch (error) {
    next(error);
  }
};

exports.updateWishlistNotification = async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const { notify } = req.body;

    const wishlist = await Wishlist.findOne({ user: req.user.id });
    
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Lista de deseos no encontrada'
      });
    }


     const item = wishlist.items.find(
      item => item.game.toString() === gameId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Juego no encontrado en la lista'
      });
    }

    item.notify = notify;
    await wishlist.save();

    res.json({
      success: true,
      message: notify ? 'Te notificaremos cuando baje de precio' : 'Notificaciones desactivadas'
    });
  } catch (error) {
    next(error);
  }
};

exports.shareWishlist = async (req, res, next) => {
  try {
    const { email } = req.body;

    const wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate('items.game', 'name price image');

    if (!wishlist || wishlist.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No tienes juegos en tu lista de deseos para compartir'
      });
    }

     if (!wishlist.shareToken) {
      wishlist.shareToken = crypto.randomBytes(16).toString('hex');
      await wishlist.save();
    }

    const shareLink = `${process.env.FRONTEND_URL}/shared-wishlist/${wishlist.shareToken}`;


      await sendEmail({
      to: email,
      subject: `${req.user.username} ha compartido su lista de deseos contigo`,
      html: `
        <h1>Lista de Deseos Compartida</h1>
        <p>${req.user.username} ha compartido su lista de deseos de GamerStore contigo.</p>
        
        <h2>Juegos en su lista:</h2>
        <ul>
          ${wishlist.items.map(item => `
            <li>${item.game.name} - $${item.game.price}</li>
          `).join('')}
        </ul>
        
        <p>Puedes ver la lista completa aquí:</p>
        <a href="${shareLink}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">
          Ver Lista de Deseos
        </a>
      `
    });

    res.json({
      success: true,
      message: 'Lista compartida correctamente'
    });
  } catch (error) {
    next(error);
  }
};

//Reseña del usuario

exports.getUserReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ user: req.user.id })
      .populate('game', 'name image category price')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ user: req.user.id });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

//obtener actividad reciente

exports.getRecentActivity = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const recentReviews = await Review.find({ user: req.user.id })
      .populate('game', 'name image')
      .sort('-createdAt')
      .limit(limit)
      .lean();

       const wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate('items.game', 'name image');

    const wishlistActivity = wishlist?.items
      .sort((a, b) => b.addedAt - a.addedAt)
      .slice(0, limit)
      .map(item => ({
        type: 'wishlist',
        game: item.game,
        date: item.addedAt,
        action: 'added_to_wishlist'
      })) || [];

       const activities = [
      ...recentReviews.map(r => ({
        type: 'review',
        game: r.game,
        date: r.createdAt,
        action: 'wrote_review',
        rating: r.rating
      })),
      ...wishlistActivity
    ].sort((a, b) => b.date - a.date).slice(0, limit);

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};