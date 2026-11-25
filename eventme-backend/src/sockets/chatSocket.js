const historialPorEvento = {};

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`🔌 Cliente conectado al chat: ${socket.id}`);

        //Unirse a la sala de un evento específico
        socket.on('join_room', ({eventoId}) => {
            const room = `evento_${eventoId}`;
            socket.join(room);

            const mensajesPrevios = historialPorEvento[room] || [];
            socket.emit('room_history', mensajesPrevios);
        });

        //Recibir y retransmitir mensajes en tiempo real dentro de la sala
        socket.on('send_message', ({eventoId, usuarioId, usuarioNombre, texto, latitud, longitud}) => {
            console.log('📩 Llegó al backend:', {eventoId, texto, latitud, longitud});
            const tieneTexto = texto && texto.trim().length > 0;
            const tieneUbicacion = latitud != null && longitud != null;

            if(!tieneTexto && !tieneUbicacion) return;

            const room = `evento_${eventoId}`;
            socket.join(room);

            const nuevoMensaje = {
                id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                eventoId,
                usuarioId,
                usuarioNombre: usuarioNombre || 'Asistente',
                texto: tieneTexto ? texto.trim(): '📍 Ubicación compartida',
                latitud: tieneUbicacion ? latitud: null,
                longitud: tieneUbicacion ? longitud: null,
                hora: new Date().toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            };

            if (!historialPorEvento[room]) {
                historialPorEvento[room] = [];  
            }
            historialPorEvento[room].push(nuevoMensaje);

            if (historialPorEvento[room].lenght > 100) {
                historialPorEvento[room].shift();
            }
            console.log('🚀 Reenviando mensaje a la sala:', room);
            io.to(room).emit('receive_message', nuevoMensaje);
        });

        socket.on('disconnect', () => {
            console.log(`❌ Cliente desconectado: ${socket.id}`);
        });
    });
};