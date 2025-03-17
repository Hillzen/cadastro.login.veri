const mysql = require("mysql2/promise");
require("dotenv").config(); // Carregar variáveis de ambient


const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "Ebz92155!",
    database: process.env.DB_NAME || "crud",
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

