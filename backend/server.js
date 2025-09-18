import dotenv from "dotenv";
import express from "express";
import cors from "cors";

// Carregar variáveis de ambiente
dotenv.config();

// Importar rotas
import campanhaRoutes from "./routes/campanhas.js";
import adminRoutes from "./routes/admin.js";
import usuarioRoutes from "./routes/usuariosBuscar.js";
import vacinasRoutes from "./routes/vacinas.js";
import usuarioRegistrarRoutes from "./routes/usuarioRegistrar.js";
import postosRoutes from "./routes/postos.js";

// Importar middleware de autenticação
import { authMiddleware } from "./middleware/auth.js";

// Configuração
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use("/campanhas", authMiddleware, campanhaRoutes);
app.use("/admin", adminRoutes); // registrar/login não precisa de token
app.use("/usuarios", authMiddleware, usuarioRoutes);
app.use("/vacinas", authMiddleware, vacinasRoutes);
app.use("/usuariosregistrar", authMiddleware, usuarioRegistrarRoutes);
app.use("/postos", authMiddleware, postosRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
