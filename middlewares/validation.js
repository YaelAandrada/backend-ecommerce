const { body, validationResult } = require('express-validator');

exports.validateRegister = [
  body('username')
    .trim()
    .notEmpty().withMessage('El username es obligatorio')
    .isLength({ min: 3, max: 30 }).withMessage('Debe tener entre 3 y 30 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Solo letras, números y guión bajo'),
  
  body('email')
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 }).withMessage('Mínimo 6 caracteres')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)/).withMessage('Debe contener al menos una letra y un número'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    }
    next();
  }
];

// Validar actualización de perfil

exports.validateProfileUpdate = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage('Debe tener entre 3 y 30 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Solo letras, números y guión bajo'),
  
  body('email')
    .optional()
    .isEmail().withMessage('Email inválido')
    .normalizeEmail(),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Máximo 500 caracteres'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

exports.validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 }).withMessage('La calificación debe ser entre 1 y 5'),
  
  body('title')
    .trim()
    .notEmpty().withMessage('El título es obligatorio')
    .isLength({ max: 100 }).withMessage('Máximo 100 caracteres'),
  
  body('comment')
    .trim()
    .notEmpty().withMessage('El comentario es obligatorio')
    .isLength({ max: 1000 }).withMessage('Máximo 1000 caracteres'),
  
  body('pros')
    .optional()
    .isArray().withMessage('Debe ser un array'),
  
  body('cons')
    .optional()
    .isArray().withMessage('Debe ser un array'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];