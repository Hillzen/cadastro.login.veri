const mysql = require("mysql2/promise");
require("dotenv").config(); // Carregar variáveis de ambient


const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME ,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
(async () => {
    try {
        const connection = await db.getConnection();
        await connection.ping();
        console.log("✅ Banco de dados conectado com sucesso!");
        connection.release();
    } catch (err) {
        console.error("❌ Erro ao conectar ao banco de dados:", err);
    }
})();



module.exports = db;

