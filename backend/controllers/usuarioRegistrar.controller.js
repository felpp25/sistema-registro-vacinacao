// import { supabase } from "../db.js";

// const usuarioRegistrarController = {
//   registrar: async (req, res) => {
//     try {
//       const aplicadorId = req.user.id;
//       const {
//         cartao_vacina,
//         vacina_id,
//         campanha_id = null,
//         data_aplicacao,
//         dose_tipo,
//         lote = null,
//         comprovante_url = null,
//         prox_aplicacao = null,
//         posto_id = null,
//       } = req.body;

//       // Validar campos obrigatórios
//       if (!cartao_vacina || !vacina_id || !data_aplicacao || !dose_tipo) {
//         return res.status(400).json({ error: "Campos obrigatórios ausentes" });
//       }

//       // Buscar usuário pelo cartao_vacina
//       const { data: usuario, error: usuarioError } = await supabase
//         .from("usuarios")
//         .select("user_id")
//         .eq("cartao_vacina", cartao_vacina)
//         .single();

//       if (usuarioError || !usuario) {
//         return res.status(404).json({ error: "Usuário não encontrado" });
//       }

//       const usuario_id = usuario.user_id;

//       // Ajustar datas para UTC
//       const dataAplicacaoUTC = new Date(data_aplicacao);
//       const proxAplicacaoUTC = prox_aplicacao ? new Date(prox_aplicacao) : null;

//       // Inserir na tabela usuario_vacinas
//       const { data, error } = await supabase
//         .from("usuario_vacinas")
//         .insert([
//           {
//             usuario_id,
//             vacina_id,
//             campanha_id,
//             data_aplicacao: dataAplicacaoUTC.toISOString().split("T")[0],
//             dose_tipo,
//             lote,
//             comprovante_url,
//             prox_aplicacao: proxAplicacaoUTC
//               ? proxAplicacaoUTC.toISOString().split("T")[0]
//               : null,
//             posto_id,
//             aplicador_id: aplicadorId,
//           },
//         ])
//         .select()
//         .single();

//       if (error) throw error;

//       res.status(201).json(data);
//     } catch (err) {
//       console.error("usuarioRegistrar error:", err);
//       res.status(500).json({
//         error: "Erro ao registrar vacina",
//         details: err.message,
//       });
//     }
//   },
// };

// export default usuarioRegistrarController;
