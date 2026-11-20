const db = require('../config/db');

//1. LISTAR TODOS LOS EVENTOS (CON SOPORTE DE FILTROS OPCIONALES POR CIUDAD Y CATEGORIA)
exports.obtenerEventos = async (req, res) => {
    try{
        const { ciudad, categoria } = req.query;

        let querySQL = 'SELECT * FROM eventos WHERE 1=1';
        const params = [];

        //FILTRO DINAMICO POR CIUDAD
        if(ciudad){
            querySQL += ' AND LOWER(ciudad) = LOWER(?)';
            params.push(ciudad); 
        }

        //FILTRO DINAMICO POR CATEGORIA
        if(categoria){
            querySQL += ' AND LOWER(categoria) = LOWER(?)';
            params.push(categoria);
        }

        //ORDENAMOS SIEMPRE CRONOLÓGICAMENTE (LOS MÁS PRÓXIMOS PRIMEROS)
        querySQL += ' ORDER BY fecha_evento ASC';

        const[eventos] = await db.query(querySQL, params);
        return res.status(200).json({
            total: eventos.length,
            eventos
        });
    }catch(error) {
        console.error('Error al obtener eventos:', error);
        return res.status(500).json({ error: 'Error interno del servidor al consultar eventos' });
    }
};

//2. OBTENER EL DETALLE DE UN EVENTO POR SU ID
exports.obtenerEventosPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const [eventos] = await db.query('SELECT * FROM eventos WHERE id = ?)', [id]);

        if(eventos.length === 0){
            return res.status(404).json({ error: 'Evento no encontrado '});
        }

        return res.status(200).json({
            evento: eventos[0]
        });
    }catch(error){
        console.error('Error al obtener detalle del evento: ', error);
        return res.status(500).json({ error: 'Error interno del servidor al consultar el evento' });
    }
};

//3. CREAR UN NUEVO EVENTO (REQUIERE AUTENTICACIÓN PREVIA)
exports.crearEvento = async (req, res) => {
    const { titulo, descripcion, categoria, fecha_evento, recinto, ciudad, latitud, longitud, imagen_url } = req.body;

    //VALIDACIÓN DE CAMPOS MÍNIMOS INDISPENSABLES
    if(!titulo || !categoria || !fecha_evento || !recinto || !ciudad) {
        return res.status(400).json({
            error: 'Campos obligatorios: titulo, categoria, fecha_evento, recinto y ciudad'
        });
    }

    try{
        const [resultado] = await db.query(
            `INSERT INTO eventos 
            (titulo, descripcion, categoria, fecha_evento, recinto, ciudad, latitud, longitud, imagen_url) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                titulo,
                descripcion || null,
                categoria,
                fecha_evento,
                recinto,
                ciudad,
                latitud || null,
                longitud || null,
                imagen_url || null
            ]
        );

        return res.status(201).json({
            message: 'Evento creado exitosamente',
            eventoId: resultado.insertId
        });
    }catch(error) {
        console.error('Error al crear evento:', error);
        return res.status(500).json({ error: 'Error interno del servidor al guardar el evento' });
    }
};