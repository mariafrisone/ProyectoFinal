const db = require ('../config/db');

//1 OBTENER TODOS LOS TICKETS DISPONIBLES PARA UN EVENTO ESPECIFICO
exports.obtenerTicketsPorEvento = async (req, res) => {
    const { eventoId } = req.params;

    try{
        const querySQL = 
        `SELECT t.id, t.precio_original, t.precio_reventa, t.asiento_zona, 
                t.descripcion, t.estado, t.creado_en, 
                u.id AS vendedor_id, u.nombre AS vendedor_nombre, u.email AS vendedor_email
        FROM tickets t
        INNER JOIN usuarios u ON t.vendedor_id = u.id
        WHERE t.evento_id = ? AND t.estado = 'disponible'
        ORDER BY t.precio_reventa ASC`;

        const [tickets] = await db.query(querySQL, [eventoId]);

        return res.status(200).json({
            total: tickets.length,
            tickets
        });
    }catch(error){
        console.error('Error al obtener tickets del evento:', error);
        return res.status(500).json({ error: 'Error interno del servidor al consultar tickets'});
    }
};

//2. PUBLICAR UN NUEVO TICKET PARA LA REVENTA
exports.publicarTicket = async (req, res) => {
    const vendedorId = req.user.id;
    const { evento_id, precio_original, precio_reventa, asiento_zona, descripcion } = req.body;

    //VALIDACION DE CAMPOS REQUERIDOS
    if(!evento_id || !precio_original || !precio_reventa) {
        return res.status(400).json({
            error: 'Campos obligaotrios: evento_id, precio_original y precio_reventa'
        });
    }
    //REGLA DE NEGOCIO FAIRTICKET: EVITAR LA ESPECULACION ABUSIVA
    if(parseFloat(precio_reventa) > parseFloat(precio_original)){
        return res.status(400).json({
            error: 'Política FairTicket: el precio de reventa no puede superar el valor original'
        });
    }
    try{
        //COMPROBAR QUE EL EVENTO EXISTA
        const [eventoExiste] = await db.query('SELECT id FROM eventos WHERE id = ?', [evento_id]);
        if(eventoExiste.length === 0){
            return res.status(404).json({ error: 'El evento especificado no existe'});
        }

        const [resultado] = await db.query (
            `INSERT INTO tickets
            (evento_id, vendedor_id, precio_original, precio_reventa, asiento_zona, descripcion, estado)
            VALUES (?, ?, ?, ?, ?, ?, 'disponible')`,
            [
                evento_id,
                vendedorId,
                precio_original,
                precio_reventa,
                asiento_zona || null,
                descripcion || null
            ]
        );
        return res.status(201).json({
            message: 'Ticket publicado a la venta con éxito',
            ticketId: resultado.insertId
        });
    }catch(error){
        console.error('Error al publicar el ticket', error);
        return res.status(500).json({ error: 'Error interno del servidor al guardar el ticket' });
    }
};

//3. OBTENER MIS TICKETS PUBLICADOS (LOS QUE YO VENDO)
exports.obtenerMisTickets = async (req, res) => {
    const usuarioId = req.user.id;

    try{
        const querySQL =`
        SELECT t.*, e.titulo AS evento_titulo, e.fecha_evento, e.recinto, e.ciudad
        FROM tickets t
        INNER JOIN eventos e ON t.evento_id = e.id
        WHERE t.vendedor_id = ?
        ORDER BY t.creado_en DESC`;

        const [misTickets] = await db.query(querySQL, [usuarioId]);

        return res.status(200).json({
            total: misTickets.length,
            tickets: misTickets
        });
}catch(error){
    console.error('Error al obtener mis tickets:', error);
    return res.status(500).json({ error: 'Error interno del servidor al consultar tus tickets' });
    }
};

//4. COMPRAR/RESERVAR UN TICKET (CAMBIA ESTADO A VENDIDO Y ASIGNA COMPRADOR)
exports.comprarTicket = async (req, res) => {
    const compradorId = req.user.id;
    const { ticketId } = req.params;

    try {
        //1. VERIFICAR SI EL TICKET EXISTE Y ESTA DISPONIBLE
        const [tickets] = await db.query(
            'SELECT id, vendedor_id, estado FROM tickets WHERE id = ?',
            [ticketId]
        );

        if (tickets.length === 0){
            return res.status(404).json({ error: 'Ticket no encontrado'});
        }
        const ticket = tickets[0];

        //2. REGLA DE NEGOCIO: NO PUEDES COMPRAR TU PROPIO TICKET
        if(ticket.vendedor_id === compradorId){
            return res.status(400).json({ error: 'No puedes comprar una entrada que tú mismo publicaste' });
        }

        //3. VERIFICAR DISPONIBILIDAD
        if(ticket.estado !== 'disponible'){
            return res.status(409).json({ error: 'Este ticket ya no se encuentra disponible para la venta' });
        }

        //4. ACTUALIZAR EL ESTADO A 'VENDIDO'
        await db.query(
            'UPDATE tickets SET estado = ?, comprador_id = ? WHERE id = ?',
            ['vendido', compradorId, ticketId]
        );

        return res.status(200).json({
            message: '¡Compra realizada con éxito! El ticket ahora está marcado como vendido',
            ticketId: ticket.id
        });
    }catch(error){
        console.error('Error al procesar la compra del ticket:', error);
        return res.status(500).json({ error: 'Error interno del servidor al procesar la compra' });
    }
};

//OBTENER LOS TICKETS QUE EL USUARIO AUTENTICADO PUSO A LA VENTA
exports.obtenerMisPublicaciones = async (req, res) => {
    const usuarioId = req.user.id;

    try {
        const querySQL = `
        SELECT t.id, t.precio_original, t.precio_reventa, t.asiento_zona
               t.descripcion, t.estado, t.creado_en,
               e.titulo AS evento_nombre, e.fecha_evento, e.recinto AS evento_lugar
        FROM tickets t
        INNER JOIN eventos e ON t.evento_id = e.id
        WHERE t.vendedor_id = ?
        ORDER BY t.creado_en DESC`;

        const [tickets] = await db.query(querySQL, [usuarioId]);

        return res.status(200).json({
            total: tickets.length,
            tickets
        });
    }catch(error){
        console.error('Error al obtener mis publicaciones:', error);
        return res.status(500).json({ error: 'Error interno del servidor al consultar tus publicaciones' });
    }
};
//OBTENER LOS TICKETS QUE EL USUARIO AUTENTICADO HA COMPRADO
exports.obtenerMisCompras = async (req, res) => {
    const usuarioId = req.user.id;

    try{
        const querySQL = `
        SELECT t.id, t.precio_reventa AS precio_pagado, t.asiento_zona,
               t.descripcion, t.creado_en,
               e.titulo AS evento_nombre, e.fecha_evento, e.recinto AS evento_lugar,
               u.nombre AS vendedor_nombre, u.email AS vendedor_email
        FROM tickets t
        INNER JOIN eventos e ON t.evento_id = e.id
        INNER JOIN usuarios u ON t.vendedor_id = u.id
        WHERE t.comprador_id = ?
        ORDER BY t.creado_en DESC`;

        const [compras] = await db.query(querySQL, [usuarioId]);

        return res.status(200).json({
            total: compras.length,
            compras
        });
    }catch(error){
        console.error('Error al obtener mis compras:', error);
        return res.status(500).json({ error: 'Error interno del servidor al consultar tus compras'});
    }
};