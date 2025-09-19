import express from "express";
import { supabase } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// POST - registrar vacina para um usuário
router.post("/", authMiddleware, async (req, res) => {
  try {
    const aplicadorId = req.user.id; // UUID do administrador logado
    const {
      usuario_id,
      vacina_id,
      data_aplicacao,
      dose_tipo,
      lote,
      comprovante_url,
      prox_aplicacao,
      posto_id,
      campanha_id
    } = req.body;

    const { error } = await supabase
      .from("usuario_vacinas")
      .insert([{
        usuario_id,
        vacina_id,
        data_aplicacao,
        dose_tipo,
        lote,
        comprovante_url,
        prox_aplicacao,
        posto_id,
        campanha_id,
        aplicador_id: aplicadorId
      }]);

    if (error) throw error;
    res.status(201).json({ message: "Vacina registrada com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
