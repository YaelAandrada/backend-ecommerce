import express from "express";

import {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  logout,
  getProfile
} from "../controllers/auth.controller.js";

import { updateUser, deleteUser, getId, getAllUsers} from "../controllers/user.controllers.js";

import { validateRegister } from "../middlewares/validation.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* ================= PUBLIC ROUTES ================= */

router.post("/register", validateRegister, register);

router.post("/login", login);

router.get("/verify-email/:token", verifyEmail);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

/* ================= PROTECTED ROUTES ================= */

router.post("/logout", protect, logout);

router.get("/me", protect, getProfile);

/* ================= PRIVATE ADMIN ROUTES ================= */

router.delete("/delete/:id", deleteUser);
router.post("/update/:id", updateUser);
router.get("/get/", getId);
router.get("/users", getAllUsers);

export default router;
