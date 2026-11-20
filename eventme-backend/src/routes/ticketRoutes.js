const express = require ('express');
const router = express.Router();
const ticketController = require ('../controllers/ticketController');
const authMiddleware = require ('../middlewares/authMiddleware');

//RUTA ESPECIFICAS PROTEGIDAS: REQUIERE ESTAR LOGUEADO
router.get('/mis-publicaciones', authMiddleware, ticketController.obtenerMisTickets);
router.get('/mis-compras', authMiddleware, ticketController.obtenerMisCompras);

//RUTA PÚBLICA: CUALQUIERA PUEDE VER LOS TICKETS A LA VENTA DE UN EVENTO
router.get('/evento/:eventoId', ticketController.obtenerTicketsPorEvento);

//RUTAS PROTEGIDAS: PARA CREAR Y COMPRAR
router.post('/', authMiddleware, ticketController.publicarTicket);
router.patch('/:ticketId/comprar', authMiddleware, ticketController.comprarTicket);

module.exports = router;