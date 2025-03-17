const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");

const router = express.Router();

// Rota de login
router.post("/login", async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: "Preencha todos os campos!" });
    }

    try {
        const [result] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);

        if (result.length === 0) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        const usuario = result[0];
        const isMatch = await bcrypt.compare(senha, usuario.senha);

        if (!isMatch) {
            return res.status(401).json({ erro: "Senha incorreta" });
        }

        res.json({ mensagem: "Login bem-sucedido!" });
    } catch (err) {
        res.status(500).json({ erro: "Erro ao processar login" });
    }
});

module.exports = router;

