// import { supabase } from "../db.js";

// const postosController = {
//   listar: async (req, res) => {
//     try {
//       const { data: postos, error } = await supabase
//         .from("postos_vacinacao")
//         .select("*")
//         .order("nome", { ascending: true });

//       if (error) throw error;
//       res.json(postos);
//     } catch (err) {
//       console.error("Erro ao listar postos:", err);
//       res.status(500).json({ error: "Não foi possível carregar os postos" });
//     }
//   },
// };

// export default postosController;
