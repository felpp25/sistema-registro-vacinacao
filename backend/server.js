import dotenv from "dotenv";
import express from "express";
import cors from "cors";

// Carregar variáveis de ambiente
dotenv.config();

// Importar rotas
import campanhaRoutes from "./routes/campanhas.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import usuarioRoutes from "./routes/usuariosBuscar.js";
import vacinasRoutes from "./routes/vacinas.js";
import usuarioRegistrarRoutes from "./routes/usuarioRegistrar.js";
import postosRoutes from "./routes/postos.js";


// Configuração

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use("/campanhas", campanhaRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/vacinas", vacinasRoutes);
app.use("/usuariosregistrar", usuarioRegistrarRoutes);
app.use("/postos", postosRoutes);


// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
