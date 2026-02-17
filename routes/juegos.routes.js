import express from "express";
import {
  createGame,
  getGames,
  getGameById,
  updateGame,
  deleteGame,
  seedGames,
  deleteAllGames
} from "../controllers/games.controller.js";

const router = express.Router();

// CRUD básico
router.post("/", createGame);        // Crear juego
router.get("/", getGames);           // Listar todos los juegos
router.get("/:id", getGameById);     // Obtener juego por ID
router.put("/:id", updateGame);// Editar juego
router.delete("/reset", deleteAllGames); // Borrar todos los juegos     
router.delete("/:id", deleteGame);   // Borrar juego


// Ruta especial para poblar con juegos reales desde FreeToGame API
router.post("/seed", seedGames);

export default router;