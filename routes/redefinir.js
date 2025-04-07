const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const db = require("../db");

const router = express.Router();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Rota para solicitar redefinição de senha
router.post("/esqueci-senha", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ erro: "Informe o e-mail!" });
    }

    try {
        const [user] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);

        if (user.length === 0) {
            return res.status(404).json({ erro: "E-mail não encontrado!" });
        }

        const token = crypto.randomBytes(32).toString("hex");

        await db.query("UPDATE usuarios SET token_redefinicao = ? WHERE email = ?", [token, email]);

        // Lembre-se de atualizar esse link se estiver usando ngrok!
        const link = `https://3b4c-2804-14c-1af-42d9-5c38-b2d7-bfa5-57c0.ngrok-free.app/api/redefinir-senha/${token}`;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Redefinição de Senha",
            html: `<p>Para redefinir sua senha, clique no link abaixo:</p>
                   <a href="${link}">${link}</a>`
        });

        res.json({ mensagem: "E-mail enviado com o link para redefinir a senha." });

    } catch (err) {
        console.error("Erro ao enviar e-mail de redefinição:", err);
        res.status(500).json({ erro: "Erro ao enviar o e-mail de redefinição." });
    }
});

// Rota para redefinir a senha
router.post("/redefinir-senha/:token", async (req, res) => {
    const { token } = req.params;
    const { novaSenha } = req.body;

    if (!novaSenha) {
        return res.status(400).json({ erro: "Informe a nova senha!" });
    }

    try {
        const [user] = await db.query("SELECT * FROM usuarios WHERE token_redefinicao = ?", [token]);

        if (user.length === 0) {
            return res.status(400).json({ erro: "Token inválido ou expirado!" });
        }

        const hashedPassword = await bcrypt.hash(novaSenha, 10);

        await db.query("UPDATE usuarios SET senha = ?, token_redefinicao = NULL WHERE token_redefinicao = ?", [hashedPassword, token]);

        res.json({ mensagem: "Senha redefinida com sucesso!" });

    } catch (err) {
        console.error("Erro ao redefinir senha:", err);
        res.status(500).json({ erro: "Erro ao redefinir a senha." });
    }
});

module.exports = router;
