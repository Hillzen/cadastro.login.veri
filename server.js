require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cadastroRoutes = require("./routes/cadastro");
const loginRoutes = require("./routes/login");
const verificacaoRoutes = require("./routes/verificacao");
const postsRoutes = require("./routes/posts");
const redefinirRoutes = require("./routes/redefinir");




const app = express();
const port = 3062;

console.log("Tipo de verificacaoRoutes:", typeof verificacaoRoutes);
console.log("VeriicacaoRoutes:", verificacaoRoutes);

app.use(cors());
app.use(express.json());

// Prefixo "/api" para organizar melhor as rotas
app.use("/api", cadastroRoutes);
app.use("/api", loginRoutes);
app.use("/api", verificacaoRoutes);
app.use("/api", postsRoutes);
app.use("/api", redefinirRoutes);


// Inicializando o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

