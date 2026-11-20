const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//1. REGISTRO DEL USUARIO
exports.register = async (req, res) => {
    const{ nombre, email, password } = req.body;

    //VALIDACION BASICA DE CAMPOS OBLIGATORIOS
    if(!nombre || !email || !password){
        return res.status(400).json({ error: 'Todos los campos son obligatorios'});
    }

    try{
        //COMPROBAR SI EL CORREO YA EXISTE
        const[existente] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
        if(existente.length > 0) {
            return res.status(409).json({ error: 'El correo electrónico ya está registrado'});
        }

        //HASHEAR LA CONTRASEÑA CON SALT DE 10 RONDAS
        const salt = await bcrypt.genSalt(10);
        const hasshedPassword = await bcrypt.hash(password, salt);

        //GUARDAR EN LA BASE DE DATOS
        const[resultado] = await db.query(
            'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
            [nombre, email, hasshedPassword]
        );

        //GENERAR TOKEN JWT INMEDIATAMENTE TRAS EL REGISTRO
        const token = jwt.sign(
            { id: resultado.insertId, email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE_IN || '7d'}
        );
        return res.status(201).json({
            message: 'Usuario registrado con éxito',
            token,
            usuario: { id: resultado.insertId, nombre, email }
        });
    }catch (error){
        console.error('Error en registro:', error);
        return res.status(500).json({ error: 'Error interno del servidor al registrar usuario' });
    }
};

//LOGIN DE USUARIO
exports.login = async (req, res) => {
    const {email, password} = req.body;

    if(!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña requeridos' });
    }

    try{
        //BUSCAR USUARIOS POR EMAIL
        const[usuarios] = await db.query('SELECT * FROM usuarios WHERE email =?', [email]);
        if(usuarios.length===0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        const usuario = usuarios[0];

        //COMPARAR LA CONTRASEÑA INGRESADA CON EL HASH GUARDADO
        const passwordValida = await bcrypt.compare(password, usuario.password);
        if(!passwordValida) {
            return res.status(401).json({ error: 'Credenciales inválidas'});
        }

        //GENERAR TOKEN JWT DE SESION
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE_IN || '7d'}
        );
        return res.status(200).json({
            message: 'Inicio de sesión correcto',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                avatar: usuario.avatar
            }
        });
    }catch (error){
        console.error('Error de login:', error);
        return res.status(500).json({ error: 'Error interno del servidor al iniciar sesión' });
    }
};

//3. OBTENER EL PERFIL DEL USUARIO
exports.obtenerPerfil = async (req, res) => {
    try{
    //REQ.USER VIENE INYECTADO DIRECTAMENTE DESDE EL MIDDLEWARE
    const [usuarios] = await db.query(
        'SELECT id, nombre, email, avatar, creado_en FROM usuarios WHERE id = ?',
        [req.user.id]
    );
    if (usuarios.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    return res.status(200).json({
        usuario:usuarios[0]
    });
    }catch (error) {
        console.error('Error al obtener el perfil:', error);
        return res.status(500).json({ error: 'Error interno del servidor al consultar el perfil' });
    }
};

