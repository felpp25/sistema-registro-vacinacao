// import { supabase } from "../db.js";

// const vacinasController = {
//   // Listar todas as vacinas
//   listar: async (req, res) => {
//     try {
//       const { data, error } = await supabase
//         .from("vacinas")
//         .select("id, nome, fabricante")
//         .order("nome");

//       if (error) {
//         console.error("Erro ao buscar vacinas:", error);
//         return res.status(500).json({ error: error.message });
//       }

//       res.json(data);
//     } catch (err) {
//       console.error("Erro inesperado ao buscar vacinas:", err);
//       res.status(500).json({ error: "Erro ao buscar vacinas." });
//     }
//   },

//   // Adicionar nova vacina
//   adicionar: async (req, res) => {
//     try {
//       const { nome, fabricante } = req.body;
//       if (!nome || !fabricante) return res.status(400).json({ error: "Preencha todos os campos." });

//       const { error } = await supabase.from("vacinas").insert([{ nome, fabricante }]);
//       if (error) throw error;

//       res.status(201).json({ message: "Vacina cadastrada com sucesso!" });
//     } catch (err) {
//       console.error("Erro ao cadastrar vacina:", err);
//       res.status(500).json({ error: "Erro interno ao cadastrar vacina." });
//     }
//   },
// };

// export default vacinasController;
