import express from "express";
import { createGame, getGames, getGameById, updateGame, deleteGame, deleteAllGames, seedGames } from "../controllers/games.controller.js";

const router = express.Router();

// Rutas específicas primero
router.post("/seed", seedGames);
router.delete("/all", deleteAllGames);

// CRUD manual
router.post("/", createGame);
router.get("/", getGames);
router.get("/:id", getGameById);
router.put("/:id", updateGame);
router.delete("/:id", deleteGame);

export default router;