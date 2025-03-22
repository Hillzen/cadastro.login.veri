const express = require("express");
const db = require("../db");
const jwt = require("jsonwebtoken"); // Importando o JWT
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "chave_super_secreta";


// Criar um post (apenas admins podem postar)
router.post("/posts", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; // Pegando o token do cabeçalho

        if (!token) {
            return res.status(401).json({ erro: "Token não fornecido." });
        }

        const decoded = jwt.verify(token, JWT_SECRET); // Decodifica o token para pegar o usuário
        const usuario_id = decoded.id; // Pegando o ID do usuário autenticado

        // Busca o usuário no banco para verificar se ele é admin
        const [rows] = await db.query("SELECT role_id FROM usuarios WHERE id = ?", [usuario_id]);

        if (rows.length === 0) {
            return res.status(404).json({ erro: "Usuário não encontrado." });
        }

        if (rows[0].role_id !== 1) {
            return res.status(403).json({ erro: "Apenas administradores podem criar posts." });
        }

        // Agora sabemos que o usuário é admin, podemos criar o post
        const { titulo, conteudo } = req.body;

        if (!titulo || !conteudo) {
            return res.status(400).json({ erro: "Título e conteúdo são obrigatórios." });
        }

        await db.query(
            "INSERT INTO posts (titulo, conteudo, usuario_id) VALUES (?, ?, ?)",
            [titulo, conteudo, usuario_id]
        );

        res.status(201).json({ mensagem: "Post criado com sucesso!" });
    } catch (error) {
        console.error("Erro ao criar post:", error);
        res.status(500).json({ erro: "Erro interno do servidor." });
    }
});

module.exports = router;

