const express = require("express");
const cors = require("cors");
require("dotenv").config();

const prisma = require("./lib/prisma");
const redacaoRoutes = require('./routes/redacao.routes');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/redacoes', redacaoRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "RedaPro API funcionando!"
  });
});

app.get("/teste-db", async (req, res) => {
  try {
    const usuarios = await prisma.user.findMany();

    res.json(usuarios);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Erro ao acessar o banco de dados"
    });
  }
});

app.post("/teste-user", async (req, res) => {
  try {
    const usuario = await prisma.user.create({
      data: {
        name: "Usuário Teste",
        email: "teste@redapro.com",
        password: "123456"
      }
    });



    res.json(usuario);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Erro ao criar usuário"
    });
  }
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`RedaPro API rodando em http://localhost:${PORT}`);
});