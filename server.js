import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import { verifyToken, isAdmin } from "./Middleware/auth.middleware.js";
import adminRoutes from "./routes/admin.routes.js";
import morgan from "morgan";
import dotenv from "dotenv";

import juegosRoutes from "./routes/juegos.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { verifyToken, isAdmin } from "./Middleware/auth.middleware.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch((err) => console.log("❌ Error Mongo:", err));

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", verifyToken, isAdmin, adminRoutes);
app.use("/verify", verifyToken);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});



// mongoose.connect("mongodb+srv://ruiz_db_user:user123@cluster0.zfdkhin.mongodb.net/ecommerce")
//   .then(() => console.log("MongoDB Atlas conectado"))
//   .catch((err) => console.log("Error MongoDB:", err));

// app.listen(3000, () => {
//   console.log("Backend corriendo en puerto 3000");
// });
dotenv.config();

const app = express();

// ================= MIDDLEWARES =================
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ================= RUTAS =================
app.use("/api/juegos", juegosRoutes);


// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor funcionando 🚀");
});

// ================= CONEXIÓN MONGODB =================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado correctamente"))
  .catch(err => console.error("❌ Error MongoDB:", err));

// ================= PUERTO =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});



app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3000;

mongoose.connect("mongodb+srv://nahueldiazquesada_db_user:Melekapo12@rollingtech.8cylx1m.mongodb.net/")
  .then(() => console.log("MongoDB Atlas conectado"))
  .catch((err) => console.log("Error MongoDB:", err));

