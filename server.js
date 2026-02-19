import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import juegosRoutes from "./routes/juegos.routes.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();

/* ================= MIDDLEWARES ================= */
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

/* ================= RUTAS ================= */
app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/juegos", juegosRoutes);

/* ================= CONEXIÓN MONGODB ================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado correctamente"))
  .catch((err) => {
    console.error("❌ Error conectando MongoDB:", err);
    process.exit(1);
  });

/* ================= PUERTO ================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
