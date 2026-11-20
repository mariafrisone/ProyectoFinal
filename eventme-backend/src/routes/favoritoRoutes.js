const express = require ('express');
const router = express.Router();
const favoritoController = require ('../controllers/favoritoController');
const authMiddleware = require ('../middlewares/authMiddleware');

//TODAS LAS RUTAS DE FAVORITOS SON PRIVADAS
router.use(authMiddleware);
router.get('/', favoritoController.obtenerFavoritos);
router.post('/toggle', favoritoController.toggleFavorito);

module.exports = router;