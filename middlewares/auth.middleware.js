import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* ================= VERIFY TOKEN ================= */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Verificar header Authorization
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No autorizado - Token no proporcionado"
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Buscar usuario real en la base
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "No autorizado - Usuario no existe"
        });
      }

      req.user = user;
      next();

    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Token inválido"
        });
      }

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expirado"
        });
      }

      return res.status(401).json({
        success: false,
        message: "No autorizado"
      });
    }

  } catch (error) {
    next(error);
  }
};

/* ================= AUTHORIZE ROLES ================= */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para realizar esta acción"
      });
    }
    next();
  };
};

/* ================= CHECK OWNERSHIP ================= */
export const checkOwnership = (model) => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params.id);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: "Recurso no encontrado"
        });
      }

      // Admin puede todo
      if (req.user.role === "admin") {
        req.resource = resource;
        return next();
      }

      if (resource.user.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "No tienes permiso para modificar este recurso"
        });
      }

      req.resource = resource;
      next();

    } catch (error) {
      next(error);
    }
  };
};
