import User from "../models/User.js";
import Wishlist from "../models/Wishlist.js";
import { sendEmail } from "../utils/email.js";
import crypto from "crypto";

/* ================= REGISTER ================= */
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Verificar usuario existente
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.email === email
            ? "El email ya está registrado"
            : "El nombre de usuario ya está en uso"
      });
    }

    // Crear usuario (el hash se hace en el modelo si tenés pre-save)
    const user = await User.create({
      username,
      email,
      password
    });

    // Crear wishlist vacía
    await Wishlist.create({
      user: user._id,
      items: []
    });

    // Generar token verificación
    const verificationToken = user.generateVerificationToken();
    await user.save();

    // Enviar email bienvenida
    await sendEmail({
      to: user.email,
      subject: "Bienvenido a GamerStore",
      html: `
        <h1>¡Bienvenido a GamerStore!</h1>
        <p>Hola ${user.username},</p>
        <p>Gracias por registrarte.</p>
        <a href="${process.env.FRONTEND_URL}/verify-email/${verificationToken}">
          Verificar Email
        </a>
      `
    });

    // JWT
    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      message: "Usuario registrado correctamente",
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

/* ================= LOGIN ================= */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas"
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas"
      });
    }

    await user.updateLastActive();

    const token = user.generateAuthToken();

    res.json({
      success: true,
      message: "Login exitoso",
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

/* ================= VERIFY EMAIL ================= */
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token inválido o expirado"
      });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Email verificado correctamente"
    });
  } catch (error) {
    next(error);
  }
};

/* ================= FORGOT PASSWORD ================= */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No existe un usuario con ese email"
      });
    }

    const resetToken = user.generateResetToken();
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: "Restablecer contraseña - GamerStore",
      html: `
        <h1>Restablecer Contraseña</h1>
        <p>Hola ${user.username},</p>
        <a href="${resetUrl}">
          Restablecer Contraseña
        </a>
        <p>Este enlace expirará en 10 minutos.</p>
      `
    });

    res.json({
      success: true,
      message: "Email enviado con instrucciones"
    });
  } catch (error) {
    next(error);
  }
};

/* ================= RESET PASSWORD ================= */
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token inválido o expirado"
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Contraseña actualizada correctamente"
    });
  } catch (error) {
    next(error);
  }
};

/* ================= LOGOUT ================= */
export const logout = async (req, res) => {
  res.json({
    success: true,
    message: "Sesión cerrada correctamente"
  });
};


/* ================= GET USER ================= */
export const getProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error obteniendo perfil"
    });
  }
};
