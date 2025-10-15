// import { supabase } from "../db.js";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import nodemailer from "nodemailer";

// const JWT_SECRET = process.env.JWT_SECRET || "segredo_super_secreto";

// const adminController = {
//   // Registrar administrador
//   register: async (req, res) => {
//     try {
//       const { nome, email, senha } = req.body;
//       if (!nome || !email || !senha)
//         return res.status(400).json({ error: "Preencha todos os campos." });

//       // Verificar email existente
//       const { data: existente, error: selectError } = await supabase
//         .from("administrador")
//         .select("email")
//         .eq("email", email)
//         .maybeSingle();
//       if (selectError) throw selectError;
//       if (existente)
//         return res.status(400).json({ error: "Email já cadastrado." });

//       const senha_hash = await bcrypt.hash(senha, 10);

//       const { error: insertError } = await supabase
//         .from("administrador")
//         .insert([{ nome, email, senha_hash }]);
//       if (insertError) throw insertError;

//       res.status(201).json({ message: "Administrador criado com sucesso!" });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: "Erro interno ao registrar administrador." });
//     }
//   },

//   // Login
//   login: async (req, res) => {
//     try {
//       const { email, senha } = req.body;
//       const { data: admin, error: selectError } = await supabase
//         .from("administrador")
//         .select("*")
//         .eq("email", email)
//         .single();

//       if (selectError || !admin)
//         return res.status(401).json({ error: "Email ou senha inválidos." });

//       const valida = await bcrypt.compare(senha, admin.senha_hash);
//       if (!valida)
//         return res.status(401).json({ error: "Email ou senha inválidos." });

//       const token = jwt.sign(
//         { id: admin.id, nome: admin.nome, email: admin.email },
//         JWT_SECRET,
//         { expiresIn: "2h" }
//       );

//       res.json({ message: "Login bem-sucedido!", token });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: "Erro interno no login." });
//     }
//   },

//   // Recuperar senha
//   recuperarSenha: async (req, res) => {
//     try {
//       const { email } = req.body;
//       if (!email) return res.status(400).json({ error: "Informe o email." });

//       const { data: admin } = await supabase
//         .from("administrador")
//         .select("*")
//         .eq("email", email)
//         .single();

//       if (admin) {
//         const token = jwt.sign({ id: admin.id }, JWT_SECRET, { expiresIn: "15m" });
//         const resetLink = `http://localhost:3000/frontend/reset-senha.html?token=${token}`;

//         const transporter = nodemailer.createTransport({
//           service: "gmail",
//           auth: {
//             user: process.env.EMAIL_USER,
//             pass: process.env.EMAIL_PASS,
//           },
//         });

//         await transporter.sendMail({
//           from: process.env.EMAIL_USER,
//           to: admin.email,
//           subject: "Redefinição de senha",
//           html: `<p>Clique no link para redefinir sua senha:</p><a href="${resetLink}">${resetLink}</a>`,
//         });
//       }

//       res.json({
//         message: "Se este email estiver cadastrado, enviaremos o link de redefinição.",
//       });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: "Erro interno." });
//     }
//   },

//   // Resetar senha
//   resetSenha: async (req, res) => {
//     try {
//       const { token, novaSenha } = req.body;
//       if (!token || !novaSenha)
//         return res.status(400).json({ error: "Token e nova senha obrigatórios." });

//       let decoded;
//       try {
//         decoded = jwt.verify(token, JWT_SECRET);
//       } catch (err) {
//         return res.status(401).json({ error: "Token inválido ou expirado." });
//       }

//       const senha_hash = await bcrypt.hash(novaSenha, 10);

//       const { error } = await supabase
//         .from("administrador")
//         .update({ senha_hash })
//         .eq("id", decoded.id);
//       if (error) throw error;

//       res.json({ message: "Senha alterada com sucesso!" });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: "Erro interno." });
//     }
//   },
// };

// export default adminController;
