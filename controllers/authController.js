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

     // Generar token de verificación
    
     const verificationToken = user.generateVerificationToken();
    await user.save();

    // Enviar email de bienvenida
    
    await sendEmail({
      to: user.email,
      subject: 'Bienvenido a GamerStore',
      html: `
        <h1>¡Bienvenido a GamerStore!</h1>
        <p>Hola ${user.username},</p>
        <p>Gracias por registrarte en nuestra tienda de videojuegos.</p>
        <p>Para verificar tu email, haz clic en el siguiente enlace:</p>
        <a href="${process.env.FRONTEND_URL}/verify-email/${verificationToken}">
          Verificar Email
        </a>
      `
    });


      // Generar token JWT
    
      const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

//Login usuario

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario incluyendo contraseña
    
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

     // Verificar contraseña
    
     const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    //Ultima actividad

    await user.updateLastActive();

     // Generar token
    
     const token = user.generateAuthToken();

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        stats: user.stats
      }
    });
  } catch (error) {
    next(error);
  }
};

// Verificacion del email

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    
    // Hashear token 
    
     const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verificado correctamente'
    });
  } catch (error) {
    next(error);
  }
};

//Reestablecer contraseña

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No existe un usuario con ese email'
      });
    }

    // Generar token
    
    const resetToken = user.generateResetToken();
    await user.save();

    
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Enviar email
   
    await sendEmail({
      to: user.email,
      subject: 'Restablecer contraseña - GamerStore',
      html: `
        <h1>Restablecer Contraseña</h1>
        <p>Hola ${user.username},</p>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para continuar:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">
          Restablecer Contraseña
        </a>
        <p>Este enlace expirará en 10 minutos.</p>
        <p>Si no solicitaste esto, ignora este email.</p>
      `
    });

    res.json({
      success: true,
      message: 'Email enviado con instrucciones'
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hashear token para comparar
    
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

     // Actualizar contraseña
    
     user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();


    await sendEmail({
      to: user.email,
      subject: 'Contraseña restablecida - GamerStore',
      html: `
        <h1>Contraseña Restablecida</h1>
        <p>Hola ${user.username},</p>
        <p>Tu contraseña ha sido restablecida correctamente.</p>
        <p>Si no realizaste este cambio, por favor contacta a soporte.</p>
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

//Cerrar sesión
exports.logout = async (req, res, next) => {
  try {
    // No hay nada que invalidar en el backend con JWT
    // El frontend eliminará el token
    
    res.json({
      success: true,
      message: 'Sesión cerrada correctamente'
    });
  } catch (error) {
    next(error);
  }
};