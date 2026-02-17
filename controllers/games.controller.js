const axios = require("axios");
const Game = require("../models/Game");

// Poblar la base con juegos reales desde FreeToGame API
exports.seedGames = async (req, res) => {
  try {
    const resApi = await axios.get("https://www.freetogame.com/api/games");
    const apiGames = resApi.data;

    // Formateamos y limitamos a 20 juegos para no sobrecargar
    const formatted = apiGames.slice(0, 20).map(g => ({
      title: g.title,
      genre: g.genre,
      platform: g.platform,
      releaseDate: g.release_date,
      rating: 0, // FreeToGame no trae rating, lo dejamos en 0
      imageUrl: g.thumbnail
    }));

    await Game.insertMany(formatted);
    res.json({ message: "✅ Juegos importados desde FreeToGame", count: formatted.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};