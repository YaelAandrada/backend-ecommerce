import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);


mongoose.connect("mongodb+srv://ruiz_db_user:user123@cluster0.zfdkhin.mongodb.net/ecommerce")
  .then(() => console.log("MongoDB Atlas conectado"))
  .catch((err) => console.log("Error MongoDB:", err));

app.listen(3000, () => {
  console.log("Backend corriendo en puerto 3000");
});
