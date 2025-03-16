const mysql = require("mysql2/promise");
require("dotenv").config(); // Carregar variáveis de ambiente

const db = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "Ebz92155!",
    database: process.env.DB_NAME || "crud",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = db;

