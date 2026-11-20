const express = require('express');
const router = express.Router();
const authController = require('../controllers/authcontroller');
const authMiddleware = require('../middlewares/authMiddleware');

//ENDPOINTS PUBLICOS DE AUTENTICACION
router.post('/register', authController.register);
router.post('/login', authController.login);

//ENDPOINT PROTEGIDO (REQUIERE TOKEN)
router.get('/perfil', authMiddleware, authController.obtenerPerfil);

module.exports = router;