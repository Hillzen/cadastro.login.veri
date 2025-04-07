require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const router = express.Router();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.log("Erro de conexão:", error);
    } else {
        console.log("Conexão bem-sucedida:", success);
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
        
        // Todo dia que rodar o ngrok na maquina, esse link http vai mudar,entao tem que vir aqui e trocar se não vai dar erro!!
        const linkVerificacao = `  https://3b4c-2804-14c-1af-42d9-5c38-b2d7-bfa5-57c0.ngrok-free.app/api/verificar-email/${tokenVerificacao}`;
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

