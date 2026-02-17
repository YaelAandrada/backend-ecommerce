import express from "express";
import { createGame, getGames, getGameById, updateGame, deleteGame, seedGames } from "../controllers/games.controller.js";

const router = express.Router();

router.post("/", createGame);
router.get("/", getGames);
router.get("/:id", getGameById);
router.put("/:id", updateGame);
router.delete("/:id", deleteGame);
router.post("/seed", seedGames);

export default router;   //