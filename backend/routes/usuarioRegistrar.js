// routes/usuarioRegistrar.js
import express from "express";
import { supabase } from "../db.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /usuarioRegistrar
 * Criar novo registro de vacina para um usuário
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const aplicadorId = req.user?.id || null;
    const {
      cartao_vacina,
      vacina_id,
      campanha_id = null,
      data_aplicacao,
      dose_tipo,
      lote = null,
      comprovante_url = null,
      prox_aplicacao = null,
      posto_id = null,
      tem_retorno = null
    } = req.body;

    // validações básicas
    if (!cartao_vacina || !vacina_id || !data_aplicacao || !dose_tipo) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes" });
    }

    // validar vacina_id numérico
    const vacinaIdNum = parseInt(vacina_id, 10);
    if (Number.isNaN(vacinaIdNum)) return res.status(400).json({ error: "vacina_id inválido" });

    // Buscar usuário pelo cartao_vacina
    const { data: usuario, error: usuarioError } = await supabase
      .from("usuarios")
      .select("user_id")
      .eq("cartao_vacina", cartao_vacina)
      .maybeSingle();

    if (usuarioError) throw usuarioError;
    if (!usuario) return res.status(404).json({ error: "Usuário não encontrado" });

    const usuario_id = usuario.user_id;

    // Normalizar data_aplicacao
    const dataAplicacaoUTC = new Date(data_aplicacao);
    if (Number.isNaN(dataAplicacaoUTC.getTime())) return res.status(400).json({ error: "data_aplicacao inválida" });
    const dataAplicacaoStr = dataAplicacaoUTC.toISOString().split("T")[0];

    // Normalizar prox_aplicacao (opcional)
    const proxAplicacaoUTC = prox_aplicacao ? new Date(prox_aplicacao) : null;
    const proxAplicacaoStr = proxAplicacaoUTC && !Number.isNaN(proxAplicacaoUTC.getTime())
      ? proxAplicacaoUTC.toISOString().split("T")[0]
      : null;

    // (Opcional) verificar posto existe
    if (posto_id) {
      const { data: postoData, error: postoErr } = await supabase
        .from("postos_vacinacao")
        .select("id")
        .eq("id", posto_id)
        .maybeSingle();
      if (postoErr) throw postoErr;
      if (!postoData) return res.status(400).json({ error: "Posto informado não existe" });
    }

    // definir status conforme se há retorno
    const hasReturn = !!(proxAplicacaoStr || tem_retorno === true);
    const status = hasReturn ? "pendente" : "concluida";

    const payload = {
      usuario_id,
      vacina_id: vacinaIdNum,
      campanha_id,
      data_aplicacao: dataAplicacaoStr,
      dose_tipo,
      lote,
      comprovante_url,
      prox_aplicacao: proxAplicacaoStr,
      posto_id,
      aplicador_id: aplicadorId,
      status,
      tem_retorno: !!(proxAplicacaoStr || tem_retorno === true),
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString()
    };

    // Inserir e retornar com relacionamentos úteis
    const { data, error } = await supabase
      .from("usuario_vacinas")
      .insert([payload])
      .select(`
        id,
        usuario_id,
        vacina_id,
        data_aplicacao,
        dose_tipo,
        lote,
        comprovante_url,
        prox_aplicacao,
        posto_id,
        aplicador_id,
        status,
        tem_retorno,
        criado_em,
        atualizado_em,
        vacinas ( id, nome, fabricante ),
        postos_vacinacao ( id, nome )
      `)
      .maybeSingle();

    if (error) throw error;
    return res.status(201).json(data);
  } catch (err) {
    console.error("usuarioRegistrar POST error:", err);
    return res.status(500).json({ error: "Erro ao registrar vacina", details: err.message });
  }
});

/**
 * PUT /usuarioRegistrar/:id
 * Atualizar registro de usuario_vacinas (edição feita pelo aplicador)
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const aplicadorId = req.user?.id || null;
    const {
      dose_tipo,
      data_aplicacao,
      lote,
      prox_aplicacao,
      posto_id,
      tem_retorno
    } = req.body;

    // buscar registro
    const { data: existente, error: fetchErr } = await supabase
      .from("usuario_vacinas")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!existente) return res.status(404).json({ error: "Vacina não encontrada." });

    // opcional: verificar permissão (descomente se necessário)
    // if (existente.aplicador_id && existente.aplicador_id !== aplicadorId) {
    //   return res.status(403).json({ error: "Sem permissão para editar." });
    // }

    const updatePayload = { atualizado_em: new Date().toISOString() };

    if (dose_tipo !== undefined) updatePayload.dose_tipo = dose_tipo;
    if (data_aplicacao !== undefined) {
      if (data_aplicacao === null || data_aplicacao === "") {
        updatePayload.data_aplicacao = null;
      } else {
        const d = new Date(data_aplicacao);
        if (Number.isNaN(d.getTime())) return res.status(400).json({ error: "data_aplicacao inválida" });
        updatePayload.data_aplicacao = d.toISOString().split("T")[0];
      }
    }
    if (lote !== undefined) updatePayload.lote = lote;
    if (posto_id !== undefined) updatePayload.posto_id = posto_id;

    if (prox_aplicacao !== undefined) {
      if (prox_aplicacao === null || prox_aplicacao === "") {
        updatePayload.prox_aplicacao = null;
      } else {
        const p = new Date(prox_aplicacao);
        if (Number.isNaN(p.getTime())) return res.status(400).json({ error: "prox_aplicacao inválida" });
        updatePayload.prox_aplicacao = p.toISOString().split("T")[0];
      }
    }

    // definir status com base no prox_aplicacao / tem_retorno
    if (tem_retorno === true || (updatePayload.prox_aplicacao && updatePayload.prox_aplicacao.length > 0)) {
      updatePayload.status = "pendente";
      updatePayload.tem_retorno = true;
    } else if (tem_retorno === false || (prox_aplicacao !== undefined && (prox_aplicacao === null || prox_aplicacao === ""))) {
      updatePayload.status = "concluida";
      updatePayload.tem_retorno = false;
      updatePayload.prox_aplicacao = null;
    }

    const { data, error } = await supabase
      .from("usuario_vacinas")
      .update(updatePayload)
      .eq("id", id)
      .select(`
        id,
        usuario_id,
        vacina_id,
        data_aplicacao,
        dose_tipo,
        lote,
        prox_aplicacao,
        posto_id,
        aplicador_id,
        status,
        tem_retorno,
        atualizado_em,
        vacinas ( id, nome, fabricante ),
        postos_vacinacao ( id, nome )
      `)
      .maybeSingle();

    if (error) throw error;
    return res.json({ message: "Atualizado com sucesso", vacina: data });
  } catch (err) {
    console.error("usuarioRegistrar PUT error:", err);
    return res.status(500).json({ error: "Erro ao atualizar vacina.", details: err.message });
  }
});

/**
 * POST /usuarioRegistrar/:id/concluir
 * Marca a vacina pendente como concluída (botão do aplicador)
 */
router.post("/:id/concluir", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const aplicadorId = req.user?.id || null;

    // Buscar registro
    const { data: existente, error: fetchErr } = await supabase
      .from("usuario_vacinas")
      .select("id, aplicador_id, status")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!existente) return res.status(404).json({ error: "Registro não encontrado." });

    // (Opcional) validar permissão do aplicador:
    // if (existente.aplicador_id && existente.aplicador_id !== aplicadorId) return res.status(403).json({ error: "Sem permissão." });

    const updatePayload = {
      status: "concluida",
      prox_aplicacao: null,
      atualizado_em: new Date().toISOString(),
      atualizado_por: aplicadorId
    };

    const { data, error } = await supabase
      .from("usuario_vacinas")
      .update(updatePayload)
      .eq("id", id)
      .select(`
        id,
        usuario_id,
        vacina_id,
        data_aplicacao,
        dose_tipo,
        lote,
        prox_aplicacao,
        posto_id,
        aplicador_id,
        status,
        atualizado_em
      `)
      .maybeSingle();

    if (error) throw error;
    return res.json({ message: "Vacina marcada como concluída.", vacina: data });
  } catch (err) {
    console.error("usuarioRegistrar CONCLUIR error:", err);
    return res.status(500).json({ error: "Erro ao concluir vacina.", details: err.message });
  }
});

/**
 * GET /usuarioRegistrar/pendentes/:cartao_vacina
 * Lista vacinas pendentes para um usuário (ordenadas pela data)
 */
router.get("/pendentes/:cartao_vacina", authMiddleware, async (req, res) => {
  try {
    const { cartao_vacina } = req.params;

    const { data: usuario, error: usuarioError } = await supabase
      .from("usuarios")
      .select("user_id")
      .eq("cartao_vacina", cartao_vacina)
      .maybeSingle();

    if (usuarioError) throw usuarioError;
    if (!usuario) return res.status(404).json({ error: "Usuário não encontrado" });

    const { data: pendentes, error } = await supabase
      .from("usuario_vacinas")
      .select(`
        id,
        data_aplicacao,
        dose_tipo,
        lote,
        comprovante_url,
        prox_aplicacao,
        status,
        tem_retorno,
        vacinas ( id, nome, fabricante ),
        postos_vacinacao ( id, nome ),
        aplicador:aplicador_id ( id, nome )
      `)
      .eq("usuario_id", usuario.user_id)
      .eq("status", "pendente")
      .order("data_aplicacao", { ascending: false });

    if (error) throw error;
    return res.json({ pendentes: pendentes || [] });
  } catch (err) {
    console.error("usuarioRegistrar PENDENTES error:", err);
    return res.status(500).json({ error: "Erro ao buscar pendentes.", details: err.message });
  }
});

export default router;
