const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verificar token

exports.protect = async (req, res, next) => {
  try {
    let token;

     // Verificar header
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado - Token no proporcionado'
      });
    }

    try {

   const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Buscar usuario

      const user = await User.findById(decoded.id);

       if (!user) {
        return res.status(401).json({
          success: false,
          message: 'No autorizado - Usuario no existe'
        });
      }

    
    req.user = user;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Token inválido'
        });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expirado'
        });
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};
// Middleware: Autorizar por roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción'
      });
    }
    next();
  };
};

exports.checkOwnership = (model) => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params.id);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Recurso no encontrado'
        });
      }

         // Admin puede hacer todo
      
         if (req.user.role === 'admin') {
        req.resource = resource;
        return next();
      }

     // Verificar si el usuario es el propietario
    
     if (resource.user.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para modificar este recurso'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};