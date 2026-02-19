import express from "express";
import { verifyToken, isAdmin } from "../Middleware/auth.middleware.js";

const router = express.Router();

router.get("/check-admin", verifyToken, isAdmin, (req, res) => {
  res.json({ ok: true });
});



export default router;