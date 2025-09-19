import express from "express";
import { supabase } from "../db.js";
import { authMiddleware } from "../middleware/auth.js"; // importando o middleware

const router = express.Router();

/**
 * GET - Listar todas as vacinas
 * Protegida: só pode acessar se estiver logado
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("vacinas")
      .select("id, nome, fabricante")
      .order("nome");

    if (error) {
      console.error("Erro ao buscar vacinas:", error);
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error("Erro inesperado ao buscar vacinas:", err);
    res.status(500).json({ error: "Erro ao buscar vacinas." });
  }
});

/**
 * POST - Adicionar nova vacina
 * Protegida: só pode acessar se estiver logado
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { nome, fabricante } = req.body;
    if (!nome || !fabricante) return res.status(400).json({ error: "Preencha todos os campos." });

    const { error } = await supabase.from("vacinas").insert([{ nome, fabricante }]);
    if (error) throw error;

    res.status(201).json({ message: "Vacina cadastrada com sucesso!" });
  } catch (err) {
    console.error("Erro ao cadastrar vacina:", err);
    res.status(500).json({ error: "Erro interno ao cadastrar vacina." });
  }
});

export default router;


// import express from "express";
// import { authMiddleware } from "../middleware/auth.js";
// import vacinasController from "../controllers/vacinas.controller.js";

// const router = express.Router();

// // Listar todas as vacinas (rota protegida)
// router.get("/", authMiddleware, vacinasController.listar);

// // Adicionar nova vacina (rota protegida)
// router.post("/", authMiddleware, vacinasController.adicionar);

// export default router;
