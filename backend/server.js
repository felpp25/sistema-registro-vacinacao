import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Necessário para usar __dirname em ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config();

// Importar rotas
import campanhaRoutes from "./routes/campanhas.js";
import adminRoutes from "./routes/admin.js";
import usuarioRoutes from "./routes/usuariosBuscar.js";
import vacinasRoutes from "./routes/vacinas.js";
import usuarioRegistrarRoutes from "./routes/usuarioRegistrar.js";
import usuarioVacinasRoutes from "./routes/usuarioVacinas.js";
import postosRoutes from "./routes/postos.js";


// Importar middleware de autenticação
import { authMiddleware } from "./middleware/auth.js";

// Configuração
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas da API
app.use("/campanhas", authMiddleware, campanhaRoutes);
app.use("/admin", adminRoutes); // registrar/login não precisa de token
app.use("/usuarios", authMiddleware, usuarioRoutes);
app.use("/vacinas", authMiddleware, vacinasRoutes);
app.use("/usuariosregistrar", authMiddleware, usuarioRegistrarRoutes);
app.use("/usuario_vacinas", authMiddleware, usuarioVacinasRoutes);
app.use("/postos", authMiddleware, postosRoutes);

// ===============================
// 🚀 Opção 2: Servir frontend localmente pelo Node
// (No futuro, quando quiser desligar o Live Server)
// Basta descomentar este trecho 👇
// ===============================

// app.use(express.static(path.join(__dirname, "../frontend/public")));

// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "../frontend/public/index.html"));
// });

// ===============================

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
});
