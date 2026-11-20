const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middlewares/authMiddleware');

//RUTAS PÚBLICAS (CUALQUIERA PUEDE VER LA CARTELERA)
router.get('/', eventController.obtenerEventos);
router.get('/:id', eventController.obtenerEventosPorId);

//RUTA PROTEGIDA (SOLO USUARIOS AUTENTICADOS CON TOKEN PUEDEN PUBLICAR EVENTOS)
router.post('/', authMiddleware, eventController.crearEvento);

module.exports = router;