// import { supabase } from "../db.js";

// const campanhasController = {
//   // Criar nova campanha
//   criar: async (req, res) => {
//     try {
//       console.log("POST /campanhas - corpo recebido:", req.body);

//       const { vacina_id: raw_vacina_id, dose } = req.body;
//       const vacina_id = parseInt(raw_vacina_id, 10);
//       const aplicadorId = req.user.id;

//       if (isNaN(vacina_id) || !dose?.trim()) {
//         return res.status(400).json({ error: "Campos 'vacina_id' e 'dose' são obrigatórios e válidos." });
//       }

//       const dataISO = new Date().toISOString().split("T")[0];

//       const { data: existente, error: selectError } = await supabase
//         .from("campanhas")
//         .select("*")
//         .eq("data", dataISO)
//         .eq("aplicador_id", aplicadorId);

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
//         criado_em: new Date().toISOString()
//       };

//       const { data: nova, error: insertError } = await supabase
//         .from("campanhas")
//         .insert([payload])
//         .select("id, vacina_id, dose, data, encerrada, criado_em, vacinas(nome, fabricante), aplicador:aplicador_id(nome)");

//       if (insertError) throw insertError;

//       console.log("Nova campanha criada com sucesso:", nova[0]);
//       return res.status(201).json({ campanha: nova[0] });

//     } catch (err) {
//       console.error("ERRO AO CRIAR CAMPANHA:", err);
//       return res.status(500).json({ error: "Erro ao criar campanha." });
//     }
//   },

//   // Verificar campanhas de hoje
//   campanhasHoje: async (req, res) => {
//     try {
//       const aplicadorId = req.user.id;
//       const hojeISO = new Date().toISOString().split("T")[0];

//       const { data: campanhas, error } = await supabase
//         .from("campanhas")
//         .select("id, vacina_id, dose, data, encerrada, vacinas(nome, fabricante), aplicador:aplicador_id(nome)")
//         .eq("data", hojeISO)
//         .eq("aplicador_id", aplicadorId);

//       if (error) return res.status(500).json({ error: error.message });

//       res.json({ existe: campanhas && campanhas.length > 0, campanhas });
//     } catch (err) {
//       console.error("Erro ao verificar campanha de hoje:", err);
//       res.status(500).json({ error: "Erro ao verificar campanha de hoje." });
//     }
//   },

//   // Listar todas as campanhas
//   listar: async (req, res) => {
//     try {
//       const { data: campanhas, error } = await supabase
//         .from("campanhas")
//         .select("id, vacina_id, dose, data, encerrada, vacinas(nome, fabricante), aplicador:aplicador_id(nome)");

//       if (error) return res.status(500).json({ error: error.message });

//       console.log(`GET /campanhas - ${campanhas.length} campanhas retornadas`);
//       res.json(campanhas);
//     } catch (err) {
//       console.error("Erro ao buscar campanhas:", err);
//       res.status(500).json({ error: "Erro ao buscar campanhas." });
//     }
//   },

//   // Buscar campanha por ID
//   buscarPorId: async (req, res) => {
//     const { id } = req.params;
//     try {
//       const { data: campanha, error } = await supabase
//         .from("campanhas")
//         .select("id, vacina_id, dose, data, encerrada, vacinas(nome, fabricante), aplicador:aplicador_id(nome)")
//         .eq("id", id)
//         .single();

//       if (error || !campanha) return res.status(404).json({ error: "Campanha não encontrada." });

//       console.log("GET /campanhas/:id - encontrada:", campanha);
//       res.json(campanha);
//     } catch (err) {
//       console.error("Erro ao buscar campanha:", err);
//       res.status(500).json({ error: "Erro ao buscar campanha." });
//     }
//   },

//   // Soft-delete de campanha
//   deletar: async (req, res) => {
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
//         .select("id, vacina_id, dose, data, encerrada, deleted, vacinas(nome, fabricante)");

//       if (error) return res.status(500).json({ error: error.message });
//       if (!updated || updated.length === 0)
//         return res.status(404).json({ error: "Campanha não encontrada." });

//       console.log(`Campanha deletada pelo admin "${adminName}" - IP: ${req.ip}`, updated[0]);

//       return res.json({
//         message: "Campanha marcada como deletada (soft-delete).",
//         campanha: updated[0]
//       });
//     } catch (err) {
//       console.error("Erro ao deletar campanha:", err);
//       return res.status(500).json({ error: "Erro ao deletar (soft) campanha." });
//     }
//   },

//   // Encerrar campanha
//   encerrar: async (req, res) => {
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
//         .select("id, vacina_id, dose, data, encerrada, vacinas(nome, fabricante), aplicador:aplicador_id(nome)");

//       if (error) return res.status(500).json({ error: error.message });
//       if (!updated || updated.length === 0) return res.status(404).json({ error: "Campanha não encontrada." });

//       console.log("Campanha encerrada:", updated[0]);
//       res.status(200).json({
//         message: "Campanha encerrada com sucesso.",
//         campanha: updated[0]
//       });
//     } catch (err) {
//       console.error("Erro ao encerrar campanha:", err);
//       res.status(500).json({ error: "Erro ao encerrar campanha." });
//     }
//   },
// };

// export default campanhasController;
