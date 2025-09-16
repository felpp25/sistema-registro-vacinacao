import express from "express";
import { supabase } from "../db.js";

const router = express.Router();



/**
 * CREATE - Criar nova campanha
 */
router.post("/", async (req, res) => {
  try {
    console.log("POST /campanhas - corpo recebido:", req.body);

    const { vacina_id: raw_vacina_id, dose, aplicador } = req.body;

    const vacina_id = parseInt(raw_vacina_id, 10);

    // Validação mais robusta: verifica se vacina_id é um número válido e se os outros campos não estão vazios.
    if (isNaN(vacina_id) || !dose?.trim() || !aplicador?.trim()) {
      console.log("POST /campanhas - falhou: campos obrigatórios faltando");
      return res.status(400).json({ error: "Campos 'vacina_id', 'dose' e 'aplicador' são obrigatórios e devem ser válidos." });
    }

    const dataISO = new Date().toISOString().split("T")[0];

    console.log(`Verificando campanhas existentes para '${aplicador.trim()}' em: ${dataISO}`);

    const { data: existente, error: selectError } = await supabase
      .from("campanhas")
      .select("*")
      .eq("data", dataISO)
      .ilike("aplicador", aplicador.trim());

    if (selectError) {
      console.error("Erro select existente:", selectError);
      return res.status(500).json({ error: selectError.message });
    }

    if (existente && existente.length > 0) {
      console.log("Campanha já existente hoje:", existente);
      return res.status(400).json({
        error: "⚠️ Já existe um QR Code gerado para hoje. Contate o suporte para desbloqueio."
      });
    }

    const payload = {
      vacina_id,
      dose,
      data: dataISO,
      aplicador: aplicador.trim(),
      encerrada: false,
      criado_em: new Date().toISOString()
    };

    const { data: nova, error: insertError } = await supabase
      .from("campanhas")
      .insert([payload])
      .select("*, vacinas(nome, fabricante)");

    if (insertError) {
      const msg = (insertError.message || "").toLowerCase();
      if (msg.includes("duplicate") || msg.includes("unique")) {
        return res.status(400).json({
          error: "⚠️ Já existe um QR Code gerado para hoje. Contate o suporte para desbloqueio."
        });
      }
      return res.status(500).json({ error: insertError.message });
    }

    console.log("Nova campanha criada com sucesso:", nova[0]);
    return res.status(201).json({ campanha: nova[0] });
  } catch (err) {
    console.error("ERRO AO CRIAR CAMPANHA:", err);
    return res.status(500).json({ error: "Erro ao criar campanha." });
  }
});

/**
 * Verifica se já existe campanha hoje para um aplicador
 */
router.get("/hoje", async (req, res) => {
  const { aplicador } = req.query;

  if (!aplicador) {
    return res.status(400).json({ error: "Parâmetro 'aplicador' é obrigatório." });
  }

  try {
    const hojeISO = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const { data: campanhas, error } = await supabase
      .from("campanhas")
      .select("*, vacinas(nome, fabricante)")
      .eq("data", hojeISO)
      .ilike("aplicador", aplicador);

    if (error) return res.status(500).json({ error: error.message });

    res.json({ existe: campanhas && campanhas.length > 0, campanhas: campanhas });
  } catch (err) {
    console.error("Erro ao verificar campanha de hoje:", err);
    res.status(500).json({ error: "Erro ao verificar campanha de hoje." });
  }
});

/**
 * READ - Listar todas as campanhas
 */
router.get("/", async (req, res) => {
  try {
    const { data: campanhas, error } = await supabase
      .from("campanhas")
      .select("*, vacinas(nome, fabricante)");

    if (error) return res.status(500).json({ error: error.message });
    console.log(`GET /campanhas - ${campanhas.length} campanhas retornadas`);
    res.json(campanhas);
  } catch (err) {
    console.error("Erro ao buscar campanhas:", err);
    res.status(500).json({ error: "Erro ao buscar campanhas." });
  }
});

/**
 * READ - Buscar campanha por ID
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { data: campanha, error } = await supabase
      .from("campanhas")
      .select("*, vacinas(nome, fabricante)")
      .eq("id", id)
      .single();

    if (error || !campanha) {
      console.log("GET /campanhas/:id - não encontrada:", id);
      return res.status(404).json({ error: "Campanha não encontrada." });
    }
    console.log("GET /campanhas/:id - encontrada:", campanha);
    res.json(campanha);
  } catch (err) {
    console.error("Erro ao buscar campanha:", err);
    res.status(500).json({ error: "Erro ao buscar campanha." });
  }
});

/**
 * DELETE - Excluir campanha (soft-delete)
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const adminKey = req.headers["x-admin-key"];
  const adminName = req.headers["x-admin-name"] || "admin-unknown";

  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    console.log("DELETE /campanhas/:id - acesso negado");
    return res.status(403).json({ error: "Acesso negado. Cabeçalho x-admin-key inválido." });
  }

  try {
    const timestamp = new Date().toISOString();

    const { data: updated, error } = await supabase
      .from("campanhas")
      .update({
        encerrada: true,
        deleted: true,
        deleted_por: adminName,
        deleted_em: timestamp,
        atualizado_em: timestamp
      })
      .eq("id", id)
      .select("*, vacinas(nome, fabricante)");

    if (error) return res.status(500).json({ error: error.message });
    if (!updated || updated.length === 0) return res.status(404).json({ error: "Campanha não encontrada." });

    console.log(`Campanha deletada pelo admin "${adminName}":`, updated[0]);
    return res.json({
      message: "Campanha marcada como deletada (soft-delete).",
      campanha: updated[0]
    });
  } catch (err) {
    console.error("Erro ao deletar campanha:", err);
    return res.status(500).json({ error: "Erro ao deletar (soft) campanha." });
  }
});

/**
 * Encerrar campanha
 */
router.post("/:id/encerrar", async (req, res) => {
  const { id } = req.params;

  try {
    const { data: updated, error } = await supabase
      .from("campanhas")
      .update({ encerrada: true, atualizado_em: new Date().toISOString() })
      .eq("id", id)
      .select("*, vacinas(nome, fabricante)");

    if (error) return res.status(500).json({ error: error.message });
    console.log("Campanha encerrada:", updated && updated[0]);
    res.status(200).json({
      message: "Campanha encerrada com sucesso.",
      campanha: updated && updated[0]
    });
  } catch (err) {
    console.error("Erro ao encerrar campanha:", err);
    res.status(500).json({ error: "Erro ao encerrar campanha." });
  }
});

export default router;
