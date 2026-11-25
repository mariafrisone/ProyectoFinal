const http = require('http');
const app = require('./src/app');
const { Server } = require('socket.io');
require('dotenv').config();
require('./src/config/db');

const PORT = process.env.PORT || 3000;

//CREAR SERVIDOR HTTP CON EXPRESS
const server = http.createServer(app);

//INICIALIZAR WEBSOCKETS
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

//CARGAR EVENTOS DEL CHAT
require('./src/sockets/chatSocket')(io);

//LEVANTAR EL SERVIDOR
server.listen(PORT, '0.0.0.0',() =>{
    console.log(`🚀 Servidor EventMe corriendo en http://localhost:${PORT}`);
});