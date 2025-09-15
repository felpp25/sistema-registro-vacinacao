import express from "express";
import { supabase } from "../db.js";

const router = express.Router();

// Buscar usuário pelo número do cartão de vacina
router.get("/:cartao_vacina", async (req, res) => {
  try {
    const { cartao_vacina } = req.params;

    console.log("Buscando usuário com cartao_vacina:", cartao_vacina);

    // Buscar usuário
    const { data: usuario, error: usuarioError } = await supabase
      .from("usuarios")
      .select("*")
      .eq("cartao_vacina", cartao_vacina)
      .single();

    if (usuarioError || !usuario) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Buscar vacinas do usuário + info da campanha + info do posto
    const { data: vacinas, error: vacinasError } = await supabase
      .from("usuario_vacinas")
      .select(`
        id,
        data_aplicacao,
        dose_tipo,
        lote,
        comprovante_url,
        prox_aplicacao,
        vacinas (
          id,
          nome,
          fabricante
        ),
        campanhas (
          id,
          dose,
          data,
          aplicador
        ),
        postos_vacinacao (
          id,
          nome
        )
      `)
      .eq("usuario_id", usuario.user_id);

    if (vacinasError) throw vacinasError;

    console.log("Vacinas carregadas:", vacinas);

    // Resposta final
    res.json({
      usuario,
      vacinas: vacinas || []
    });
  } catch (err) {
    console.error("usuarioBuscar error:", err);
    res.status(500).json({ error: "Erro ao buscar usuário" });
  }
});

export default router;
