const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const router = express.Router();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user:"gmartinsdev1@gmail.com",
        pass: "s m t q e r f d r r d y d f n t"
    }
});

const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

router.post("/cadastro", async (req, res) => {
    const { nome, email, senha, data_nasc } = req.body;

    if (!nome || !email || !senha || !data_nasc) {
        return res.status(400).json({ erro: "Preencha todos os campos!" });
    }

    if (!validarEmail(email)) {
        return res.status(400).json({ erro: "Formato de e-mail inválido!" });
    }

    try {
        const [existingUser] = await db.query("SELECT email FROM usuarios WHERE email = ?", [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ erro: "E-mail já cadastrado!" });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);
        const tokenVerificacao = crypto.randomBytes(32).toString("hex");

        await db.query("INSERT INTO usuarios (nome, email, senha, data_nasc, token_verificacao) VALUES (?, ?, ?, ?, ?)", 
                      [nome, email, hashedPassword, data_nasc, tokenVerificacao]
        );
        
        const linkVerificacao = `http://localhost:3062/api/verificar-email/${tokenVerificacao}`;
        await transporter.sendMail({
            from: "seuemail@gmail.com",
            to: email,
            subject: "Verifique seu e-mail",
            html: `<p>Clique no link para verificar seu e-mail: <a href="${linkVerificacao}">${linkVerificacao}</a></p>`
        });

        res.json({ mensagem: "Usuário cadastrado com sucesso! Verifique seu e-mail para ativar a conta." });
    } catch (err) {
        console.error("Erro ao cadastrar usuário:", err);
        res.status(500).json({ erro: "Erro interno no servidor" });
    }
});

module.exports = router;

