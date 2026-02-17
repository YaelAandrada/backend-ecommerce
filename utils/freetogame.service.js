import axios from "axios";

const BASE_URL = "https://www.freetogame.com/api";

export const getFreeGames = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/games`);
    return res.data; // lista de juegos
  } catch (error) {
    console.error("Error al traer juegos:", error.message);
    return [];
  }
};