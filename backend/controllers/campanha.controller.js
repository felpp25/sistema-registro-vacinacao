// // controllers/campanhas.controller.js
// import { supabase } from "../db.js";

// const campanhasController = {
//   // Criar campanha
//   async criar(req, res) {
//     try {
//       console.log("POST /campanhas - corpo recebido:", req.body);

//       const { vacina_id: raw_vacina_id, dose } = req.body;
//       const vacina_id = parseInt(raw_vacina_id, 10);
//       const aplicadorId = req.user.id;

//       if (isNaN(vacina_id) || !dose?.trim()) {
//         return res.status(400).json({ error: "Campos 'vacina_id' e 'dose' são obrigatórios e válidos." });
//       }

//       const dataISO = new Date().toISOString().split("T")[0];

//       // Verificar apenas campanhas ativas (não deletadas)
//       const { data: existente, error: selectError } = await supabase
//         .from("campanhas")
//         .select("*")
//         .eq("data", dataISO)
//         .eq("aplicador_id", aplicadorId)
//         .eq("deleted", false);

//       if (selectError) return res.status(500).json({ error: selectError.message });

//       if (existente && existente.length > 0) {
//         return res.status(400).json({
//           error: "⚠️ Já existe um QR Code gerado para hoje. Contate o suporte para desbloqueio."
//         });
//       }

//       const payload = {
//         vacina_id,
//         dose,
//         data: dataISO,
//         aplicador_id: aplicadorId,
//         encerrada: false,
//         deleted: false,
//         criado_em: new Date().toISOString()
//       };

//       const { data: nova, error: insertError } = await supabase
//         .from("campanhas")
//         .insert([payload])
//         .select("id, vacina_id, dose, data, encerrada, deleted, criado_em, vacinas(nome, fabricante), aplicador:aplicador_id(nome)")
//         .single();

//       if (insertError) throw insertError;

//       console.log("Nova campanha criada com sucesso:", nova);
//       return res.status(201).json({ campanha: nova });

//     } catch (err) {
//       console.error("ERRO AO CRIAR CAMPANHA:", err);
//       return res.status(500).json({ error: "Erro ao criar campanha." });
//     }
//   },

//   // Campanhas de hoje (para aplicador logado)
//   async campanhasHoje(req, res) {
//     try {
//       const aplicadorId = req.user.id;
//       const hojeISO = new Date().toISOString().split("T")[0];

//       const { data: campanhas, error } = await supabase
//         .from("campanhas")
//         .select("id, vacina_id, dose, data, encerrada, deleted, vacinas(nome, fabricante), aplicador:aplicador_id(nome)")
//         .eq("data", hojeISO)
//         .eq("aplicador_id", aplicadorId)
//         .eq("deleted", false);

//       if (error) return res.status(500).json({ error: error.message });

//       return res.json({ existe: campanhas && campanhas.length > 0, campanhas });
//     } catch (err) {
//       console.error("Erro ao verificar campanha de hoje:", err);
//       return res.status(500).json({ error: "Erro ao verificar campanha de hoje." });
//     }
//   },

//   // Listar todas as campanhas (padrão só ativas não deletadas)
//   async listar(req, res) {
//     try {
//       const { data: campanhas, error } = await supabase
//         .from("campanhas")
//         .select("id, vacina_id, dose, data, encerrada, deleted, vacinas(nome, fabricante), aplicador:aplicador_id(nome)")
//         .eq("deleted", false)
//         .order("data", { ascending: false });

//       if (error) return res.status(500).json({ error: error.message });

//       return res.json(campanhas);
//     } catch (err) {
//       console.error("Erro ao buscar campanhas:", err);
//       return res.status(500).json({ error: "Erro ao buscar campanhas." });
//     }
//   },

//   // Buscar campanha por ID
//   async buscarPorId(req, res) {
//     const { id } = req.params;
//     try {
//       const { data: campanha, error } = await supabase
//         .from("campanhas")
//         .select("id, vacina_id, dose, data, encerrada, deleted, vacinas(nome, fabricante), aplicador:aplicador_id(nome)")
//         .eq("id", id)
//         .single();

//       if (error || !campanha) return res.status(404).json({ error: "Campanha não encontrada." });

//       return res.json(campanha);
//     } catch (err) {
//       console.error("Erro ao buscar campanha:", err);
//       return res.status(500).json({ error: "Erro ao buscar campanha." });
//     }
//   },

//   // Soft-delete via header x-admin-key (para Postman/admin)
//   async deletar(req, res) {
//     const { id } = req.params;
//     const adminKey = req.headers["x-admin-key"]?.trim();
//     const adminName = req.headers["x-admin-name"]?.trim() || "admin-unknown";

//     if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
//       console.log("DELETE /campanhas/:id - acesso negado");
//       return res.status(403).json({ error: "Acesso negado. Cabeçalho x-admin-key inválido." });
//     }

//     try {
//       const timestamp = new Date().toISOString();

//       const { data: updated, error } = await supabase
//         .from("campanhas")
//         .update({
//           encerrada: true,
//           deleted: true,
//           deleted_por: adminName,
//           deleted_em: timestamp,
//           atualizado_em: timestamp
//         })
//         .eq("id", id)
//         .select("id, vacina_id, dose, data, encerrada, deleted, vacinas(nome, fabricante)")
//         .single();

//       if (error) return res.status(500).json({ error: error.message });
//       if (!updated) return res.status(404).json({ error: "Campanha não encontrada." });

//       console.log(`Campanha deletada pelo admin "${adminName}" - IP: ${req.ip}`, updated);

//       return res.json({
//         message: "Campanha marcada como deletada (soft-delete).",
//         campanha: updated
//       });
//     } catch (err) {
//       console.error("Erro ao deletar campanha:", err);
//       return res.status(500).json({ error: "Erro ao deletar (soft) campanha." });
//     }
//   },

//   // Encerrar campanha (apenas marca encerrada)
//   async encerrar(req, res) {
//     const { id } = req.params;

//     try {
//       const timestamp = new Date().toISOString();

//       const { data: updated, error } = await supabase
//         .from("campanhas")
//         .update({
//           encerrada: true,
//           atualizado_em: timestamp
//         })
//         .eq("id", id)
//         .select("id, vacina_id, dose, data, encerrada, vacinas(nome, fabricante), aplicador:aplicador_id(nome)")
//         .single();

//       if (error) return res.status(500).json({ error: error.message });
//       if (!updated) return res.status(404).json({ error: "Campanha não encontrada." });

//       console.log("Campanha encerrada:", updated);
//       return res.status(200).json({
//         message: "Campanha encerrada com sucesso.",
//         campanha: updated
//       });
//     } catch (err) {
//       console.error("Erro ao encerrar campanha:", err);
//       return res.status(500).json({ error: "Erro ao encerrar campanha." });
//     }
//   }
// };

// export default campanhasController;
