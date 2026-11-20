const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    //1.OBTENER LA CABECERA 'AUTORIZACION'
    const authHeader = req.header('Authorization');

    //SI NO ENVIA CABECERA, DENEGAMOS EL ACCESO INMEDIATAMENTE
    if(!authHeader) {
        return res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token.' });
    }

    //2.COMPROBAMOS QUE EMPIECE POR 'BEARER' (IGNORANDO MAYUSCULAS/MINUSCULAS) 
    const parts = authHeader.split(' ');
    if(!authHeader.startsWith('Bearer') && !authHeader.startsWith('bearer')){
        return res.status(401).json({ error: 'Formato de token inválido. Debe ser: Bearer <token>' });
    }
    //EXTRAEMOS EL TOKEN QUITANDO LA PALABRA 'BEARER' Y LIMPIAMOS ESPACIOS EN BLANCO EN LOS EXTREMOS
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if(!token){
        return res.status(401).json({ error: 'Token no encontrado en la cabecera '});
    }

    try{
        //3. VERIFICAR Y DESCIFRAR EL TOKEN CON NUESTRA CLAVE SECRETA
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //INYECTAMOS LOS DATOS DEL USUARIO DECODIFICADO EN LA PETICION (REQ.USER)
        req.user = decoded;

        //NEXT() LE DA PASO  AL SIGUIENTE CONTROLADOR
        next();
    }catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
};