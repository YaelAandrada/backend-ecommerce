import express from "express";
import Game from "../models/Game.js";

const router = express.Router();

// Ejemplo: listar juegos
router.get("/", async (req, res) => {
  const games = await Game.find();
  res.json(games);
});

export default router;