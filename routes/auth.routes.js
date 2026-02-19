import express from "express";
import { register, login } from "../controllers/auth.controllers.js";
import { verifyToken } from "../Middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.get("/verify", verifyToken, (req, res) => {
  res.json({ ok: true, user: req.user });
});


export default router;