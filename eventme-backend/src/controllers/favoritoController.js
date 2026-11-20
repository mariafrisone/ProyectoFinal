const db = require('../config/db');

//1. OBTENER LA LISTA DE EVENTOS GUARDADOS EN FAVORITOS POR EL USUARIO ACTUAL
exports.obtenerFavoritos = async (req, res) => {
    try{
        const usuarioId = req.user.id;

        const querySQL = 
        `SELECT e.*, f.creado_en AS guardado_en 
        FROM favoritos f 
        INNER JOIN eventos e ON f.evento_id = e.id 
        WHERE f.usuario_id = ? ORDER BY f.creado_en DESC`;

        const [favoritos] = await db.query(querySQL, [usuarioId]);

        return res.status(200).json({
            total: favoritos.length,
            favoritos
        });
    }catch(error){
        console.error('Error al obtener favoritos:', error);
        return res.status(500).json({ error: 'Error interno del servidor al consultar favoritos'});
    }
};

//2. ALTERNAR FAVORITO (TOGGLE: SI NO ESTA LO AÑADE, SI YA ESTA LO ELIMINA)
exports.toggleFavorito = async (req, res) =>{
    const usuarioId = req.user.id;
    const { eventoId } = req.body;

    if(!eventoId) {
        return res.status(400).json({ error: 'El campo eventoId es obligatorio'});
    }

    try{
        //VERIFICAR PRIMERO QUE EL EVENTO EXISTA EN LA BASE DE DATOS
        const [eventoExiste] = await db.query('SELECT id FROM eventos WHERE id = ?', [eventoId]);
        if(eventoExiste.length === 0) {
            return res.status(404).json({ error: 'El evento especificado no existe'});
        }
        //COMPROBAR SI YA ESTÁ MARCADO COMO FAVORITO
        const [favoritoExistente] = await db.query(
            'SELECT id FROM favoritos WHERE usuario_id = ? AND evento_id = ?',
            [usuarioId, eventoId]
        );

        if(favoritoExistente.length > 0){
            //SI YA EXISTE LO QUITAMOS (DESMARCAR CORAZÓN)
            await db.query(
                'DELETE FROM favoritos WHERE usuario_id = ? AND evento_id = ?',
                [usuarioId, eventoId]
            );

            return res.status(200).json({
                message: 'Evento eliminado de favoritos',
                esFavorito: false
            });
        }else{
            //SI NO EXISTE LO AGREGAMOS (MARCAR CORAZÓN)
            await db.query(
                'INSERT INTO favoritos (usuario_id, evento_id) VALUES (?, ?)',
                [usuarioId, eventoId]
            );

            return res.status(201).json({
                message: 'Evento guardado en favoritos',
                esFavorito: true
            });
        }
    }catch(error){
        console.error('Error al alternar favorito:', error);
        return res.status(500).json({error: 'Error interno del servidor al gestionar favorito'});
    }
};
