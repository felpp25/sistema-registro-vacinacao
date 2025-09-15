import express from "express";
import { supabase } from "../db.js";

const router = express.Router();

/**
 * GET - Listar todas as vacinas
 */
router.get("/", async (req, res) => {
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

export default router;
