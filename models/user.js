const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { type } = require('os');

const userSchema = new nongoose.Schema({
    username:{
        type: String,
        require:  [true, 'El nombre de usuario es obligatorio'],
        unique: true,
        trim: true,
        minlength: [3, 'El nombre de usuario debe tener al menos 3 caracteres'],
        maxlength: [30, 'El nombre de usuario no puede tener más de 30 caracteres'],
        match: [/^[a-zA-Z0-9_]+$/, 'El username solo puede contener letras, números y guión bajo']
    },

    email: {
        type: String,
        require:  [true, 'El email es obligatorio'],
        unique: true,
        lowercase: true,
        trim: true,
        match:  [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },

    password: {
        type: String,
        require: [true, 'La contraseña es obligatoria'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
        selec: false
    },

    role: {
        type: String,
        enum:  ['user', 'admin'],
        default: 'user'
    },

    avatar: {
        type: String,
        default: 'https://res.cloudinary.com/tu-cloud/image/upload/v1/default-avatar.png'
    }
})