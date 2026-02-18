import axios from "axios";

const BASE_URL = "https://api.rawg.io/api";
const API_KEY = "e04f9aa53b274227b9b4fbc1c0a72166"; // tu API key

export const getRawgGames = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/games?key=${API_KEY}`);
    return res.data.results; // lista de juegos
  } catch (error) {
    console.error("Error al traer juegos de RAWG:", error.message);
    return [];
  }
};