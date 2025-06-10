const express = require("express");
const db = require("../db");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "chave_super_secreta";

// Configuração do multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const folder = "./uploads";
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }
        cb(null, folder);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    }
});

const upload = multer({ storage });

// Rota para criar posts com upload de imagem e/ou vídeo
router.post("/posts", upload.fields([
    { name: "imagem", maxCount: 1 },
    { name: "video", maxCount: 1 }
]), async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ erro: "Token não fornecido." });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const usuario_id = decoded.id;

        const [rows] = await db.query("SELECT role_id FROM usuarios WHERE id = ?", [usuario_id]);

        if (rows.length === 0) {
            return res.status(404).json({ erro: "Usuário não encontrado." });
        }

        if (rows[0].role_id !== 1) {
            return res.status(403).json({ erro: "Apenas administradores podem criar posts." });
        }

        const { titulo, conteudo } = req.body;
        if (!titulo || !conteudo) {
            return res.status(400).json({ erro: "Título e conteúdo são obrigatórios." });
        }

        const imagem = req.files["imagem"] ? req.files["imagem"][0].filename : null;
        const video = req.files["video"] ? req.files["video"][0].filename : null;

        await db.query(
            "INSERT INTO posts (titulo, conteudo, usuario_id, imagem, video) VALUES (?, ?, ?, ?, ?)",
            [titulo, conteudo, usuario_id, imagem, video]
        );

        res.status(201).json({ mensagem: "Post criado com sucesso!" });

    } catch (error) {
        console.error("Erro ao criar post:", error);
        res.status(500).json({ erro: "Erro interno do servidor." });
    }
});

module.exports = router;


