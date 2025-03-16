const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/verificar-email/:token", async (req, res) => {
    const { token } = req.params;

    try {
        const [user] = await db.query("SELECT * FROM usuarios WHERE token_verificacao = ?", [token]);

        if (user.length === 0) {
            return res.status(400).json({ erro: "Token inválido ou expirado" });
        }

        // Atualiza a conta como verificada
        await db.query("UPDATE usuarios SET email_verificado = 1, token_verificacao = NULL WHERE token_verificacao = ?", [token]);

        res.json({ mensagem: "E-mail verificado com sucesso!" });

    } catch (err) {
        console.error("Erro ao verificar e-mail:", err);
        res.status(500).json({ erro: "Erro interno no servidor" });
    }
});

module.exports = router;
