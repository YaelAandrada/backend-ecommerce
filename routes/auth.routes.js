import express from "express";
import { register, login } from "../controllers/auth.controllers.js";


const router = express.Router();

// Registro
router.post("/register", register);

// Login
router.post("/login", login);

// Editar usuario
// router.put("/users/:id", updateUser);

// Eliminar usuario
// router.delete("/users/:id", deleteUser);

export default router;
