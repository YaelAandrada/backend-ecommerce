import User from "../models/User.js";
import bcrypt from "bcryptjs";

// Registro de usuario
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Verificar usuario existente
    const userExist = await User.findOne({ email });
    if (userExist) return res.status(400).json({ msg: "Usuario ya existe" });

    // Hash de contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({ msg: "Usuario registrado" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error servidor" });
  }
};

// Login de usuario
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Usuario no encontrado" });

    // Comparar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Contraseña incorrecta" });

    // Si todo está bien
    res.status(200).json({
      msg: "Login exitoso",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error servidor" });
  }
};
