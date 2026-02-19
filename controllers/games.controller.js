import Game from "../models/Game.js";
import axios from "axios";

const BASE_URL = "https://api.rawg.io/api";
const API_KEY = "e04f9aa53b274227b9b4fbc1c0a72166"; // Api KEY 

// Crear juego manual
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

// Borrar juego específico
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

// Poblar con juegos reales desde RAWG API
export const seedGames = async (req, res) => {
  try {
    const resApi = await axios.get(`${BASE_URL}/games?key=${API_KEY}`);
    const apiGames = resApi.data.results;

    const formatted = apiGames.slice(0, 30).map(g => ({
      rawgId: g.id,
      title: g.name,
      genre: g.genres.map(gen => gen.name).join(", "),
      platform: g.platforms.map(p => p.platform.name).join(", "),
      releaseDate: g.released,
      rating: g.rating,
      imageUrl: g.background_image,
      description: g.description_raw || "",
      developer: g.developers?.[0]?.name || "Unknown",
      reviews: {
        positive: g.ratings_count || 0,
        negative: 0
      }
    }));

    await Game.insertMany(formatted);
    res.json({ message: "✅ Juegos importados desde RAWG", count: formatted.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};