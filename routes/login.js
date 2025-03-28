const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

// Chave secreta do JWT (idealmente, coloque isso em uma variável de ambiente)
const JWT_SECRET = process.env.JWT_SECRET || "chave_super_secreta";


router.post("/login", async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: "Preencha todos os campos!" });
    }

    try {
        const sql = "SELECT * FROM usuarios WHERE email = ?";
        const [rows] = await db.query(sql, [email]);

        if (rows.length === 0) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        const usuario = rows[0];

        
        const isMatch = await bcrypt.compare(senha, usuario.senha);

        if (!isMatch) {
            return res.status(401).json({ erro: "Senha incorreta" });
        }

        // Criar o token JWT
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email }, // Dados do payload
            JWT_SECRET, // Chave secreta
            { expiresIn: "1h" } // Tempo de expiração do token
        );

        res.json({ mensagem: "Login bem-sucedido!", token });
    } catch (err) {
        console.error("Erro no login:", err);
        res.status(500).json({ erro: "Erro interno no servidor" });
    }
});

module.exports = router;


