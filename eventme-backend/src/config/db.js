const mysql = require('mysql2/promise');

//POOL DE CONEXIONES PARA GESTIONAR MULTIPLES PETICIONES CONCURRENTES
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAMAE || 'eventme_db',
    port: process.env.DB_PORT || '3306',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

//FUNCION DE DIAGNOSTICO INICIAL
const testConnection = async () =>{
    try{
        const connection = await pool.getConnection();
        console.log('✅ Conexión con la base de datos MySQL (eventme_db) establecida');
        connection.release();
    }catch (error){
        console.error('❌ Error al conectar con la base de datos MySQL:', error.message);   
    }
};
testConnection();
module.exports = pool;