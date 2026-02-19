import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Verificar usuario existente
    const userExist = await User.findOne({ email });
    if (userExist) return res.status(400).json({ msg: "Usuario ya existe" });

    //  HASH PASSWORD
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
