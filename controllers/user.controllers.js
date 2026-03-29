import User from "../models/User.js";

// Editar usuario
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error servidor" });
  }
};

// Eliminar usuario
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    res.status(200).json({ msg: "Usuario eliminado" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error servidor" });
  }
};

//Id de un Usuario
export const getId = async (req, res) => {
  
  try {

    const { username } = req.body;

    const user = await User.findOne({ 
      username: username 
    }).select('_id');

    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    res.status(200).json({
      id: user._id
    });
    
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error servidor" });
  }

};


//Traer todos los usuarios
export const getAllUsers = async (req, res) => {
  try {

    const users = await User.find();
    res.json(users);

  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error servidor" });
  }
}