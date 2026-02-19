// Server
PORT=5000
NODE_ENV=development

// Database
MONGODB_URI=mongodb+srv://ruiz_db_user:<user123>@cluster0.zfdkhin.mongodb.net

// Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER="tuemail@gmail.com";
EMAIL_PASS=tu_contraseña_app

// Cloudinary (para imágenes)
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

// Frontend URL
FRONTEND_URL="http://localhost:3000"

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const errorHandler = require('./middlewares/errorHandler');

// Conectar a MongoDB

const connectDB = require('./config/database');
connectDB();

const app = express();

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 peticiones por IP
});
app.use('/api', limiter);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(mongoSanitize());
app.use(xss());


// Logging

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));

  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/games', require('./routes/gameRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando',
    timestamp: new Date().toISOString()
  });
});

// Manejo de rutas no encontradas

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});
app.use(errorHandler);

// Iniciar servidor

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`.yellow.bold);
});

process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`.red);
  server.close(() => process.exit(1));
});
}