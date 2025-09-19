import express from "express";
import { supabase } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Rota para listar todos os postos
router.get("/lista", authMiddleware, async (req, res) => {
  try {
    const { data: postos, error } = await supabase
      .from("postos_vacinacao")
      .select("*")
      .order("nome", { ascending: true });

    if (error) throw error;
    res.json(postos);
  } catch (err) {
    console.error("Erro ao listar postos:", err);
    res.status(500).json({ error: "Não foi possível carregar os postos" });
  }
});

export default router;


// import express from "express";
// import postosController from "../controllers/postos.controller.js";
// import { authMiddleware } from "../middleware/auth.js";

// const router = express.Router();

// // Listar todos os postos (rota protegida)
// router.get("/lista", authMiddleware, postosController.listar);

// export default router;
