import Game from "../models/Game.js";
import axios from "axios";

// Crear juego
export const createGame = async (req, res) => {
  try {
    const newGame = new Game(req.body);
    await newGame.save();
    res.status(201).json(newGame);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Listar juegos
export const getGames = async (req, res) => {
  try {
    const games = await Game.find();
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener juego por ID
export const getGameById = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: "Juego no encontrado" });
    res.json(game);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Editar juego
export const updateGame = async (req, res) => {
  try {
    const updatedGame = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedGame);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Borrar juego
export const deleteGame = async (req, res) => {
  try {
    await Game.findByIdAndDelete(req.params.id);
    res.json({ message: "Juego eliminado" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Borrar todos los juegos
export const deleteAllGames = async (req, res) => {
  try {
    await Game.deleteMany({});
    res.json({ message: "✅ Todos los juegos fueron eliminados" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Poblar con juegos reales desde FreeToGame API
export const seedGames = async (req, res) => {
  try {
    const resApi = await axios.get("https://www.freetogame.com/api/games");
    const apiGames = resApi.data;

    const formatted = apiGames.slice(0, 30).map(g => ({
      title: g.title,
      genre: g.genre,
      platform: g.platform,
      releaseDate: g.release_date,
      rating: 0,
      imageUrl: g.thumbnail
    }));

    await Game.insertMany(formatted);
    res.json({ message: "✅ Juegos importados desde FreeToGame", count: formatted.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};