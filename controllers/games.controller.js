const Game = require('../models/Game');

// Crear juego
exports.createGame = async (req, res) => {
  try {
    const newGame = new Game(req.body);
    await newGame.save();
    res.status(201).json(newGame);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Listar juegos
exports.getGames = async (req, res) => {
  try {
    const games = await Game.find();
    res.json(games);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener juego por ID
exports.getGameById = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Juego no encontrado' });
    res.json(game);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Editar juego
exports.updateGame = async (req, res) => {
  try {
    const updatedGame = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedGame);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Borrar juego
exports.deleteGame = async (req, res) => {
  try {
    await Game.findByIdAndDelete(req.params.id);
    res.json({ message: 'Juego eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};