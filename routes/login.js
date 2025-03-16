const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");

const router = express.Router();


// Rota de login
router.post("/login", (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: "Preencha todos os campos!" });
    }

    const sql = "SELECT * FROM usuarios WHERE email = ?";
    db.query(sql, [email], (err, result) => {
        if (err) {
            return res.status(500).json({ erro: "Erro ao buscar usuário" });
        }

        if (result.length === 0) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        const usuario = result[0];

        // Comparar a senha fornecida com a senha criptografada no banco
        bcrypt.compare(senha, usuario.senha, (err, isMatch) => {
            if (err) {
                return res.status(500).json({ erro: "Erro ao verificar senha" });
            }

            if (!isMatch) {
                return res.status(401).json({ erro: "Senha incorreta" });
            }

            res.json({ mensagem: "Login bem-sucedido!" });
        });
    });
});

module.exports = router;
