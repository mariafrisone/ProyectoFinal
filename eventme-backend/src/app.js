const express = require('express');
const cors = require('cors');

const app = express();

//MIDDLEWARES GLOBALES
app.use(cors());
app.use(express.json());

//ENDPOINT COMPROBACION (HEALTH CHECK)
app.get('/api/health', (req, res) =>{
    res.status(200).json({
        status: 'OK',
        message: 'Servidor de EventMe funcionando correctamente'
    });
});

//RUTAS DE LA API 
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/eventos', require('./routes/eventRoutes'));
app.use('/api/favoritos', require('./routes/favoritoRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));

//MANEJO DE RUTAS QUE NO EXISTEN (404)
app.use((req, res) => {
    res.status(404).json ({ error: 'Ruta no encontrada'});
});

module.exports = app;