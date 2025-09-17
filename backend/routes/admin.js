import express from "express";
import { supabase } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "segredo_super_secreto"; // ⚠️ usar .env em produção

/**
 * POST /admin/register - Criar um novo administrador
 */
router.post("/register", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: "Preencha todos os campos." });
    }

    // Verificar se já existe administrador com esse email
    const { data: existente, error: selectError } = await supabase
      .from("administrador")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (selectError) throw selectError;
    if (existente) {
      return res.status(400).json({ error: "Email já cadastrado." });
    }

    // Gerar hash da senha
    const senha_hash = await bcrypt.hash(senha, 10);

    // Inserir no banco
    const { error: insertError } = await supabase
      .from("administrador")
      .insert([{ nome, email, senha_hash }]);
    if (insertError) throw insertError;

    res.status(201).json({ message: "Administrador criado com sucesso!" });
  } catch (err) {
    console.error("Erro ao registrar admin:", err);
    res.status(500).json({ error: "Erro interno ao registrar administrador." });
  }
});

/**
 * POST /admin/login - Autenticar administrador
 */
router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    const { data: admin, error: selectError } = await supabase
      .from("administrador")
      .select("*")
      .eq("email", email)
      .single();

    if (selectError || !admin) {
      return res.status(401).json({ error: "Email ou senha inválidos." });
    }

    const valida = await bcrypt.compare(senha, admin.senha_hash);
    if (!valida) {
      return res.status(401).json({ error: "Email ou senha inválidos." });
    }

    const token = jwt.sign(
      { id: admin.id, nome: admin.nome, email: admin.email },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ message: "Login bem-sucedido!", token });
  } catch (err) {
    console.error("Erro no login do admin:", err);
    res.status(500).json({ error: "Erro interno no login." });
  }
});

/**
 * POST /admin/recuperar-senha
 * Recebe email, gera token de reset e envia email
 * Mensagem neutra para não revelar se o email existe
 */
router.post("/recuperar-senha", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Informe o email." });

    const { data: admin } = await supabase
      .from("administrador")
      .select("*")
      .eq("email", email)
      .single();

    if (admin) {
      const token = jwt.sign({ id: admin.id }, JWT_SECRET, { expiresIn: "15m" });
      const resetLink = `http://localhost:3000/reset-senha?token=${token}`;

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: admin.email,
        subject: "Redefinição de senha",
        html: `<p>Clique no link para redefinir sua senha:</p><a href="${resetLink}">${resetLink}</a>`,
      });
    }

    // Mensagem neutra
    res.json({
      message:
        "Se este email estiver cadastrado, enviaremos o link de redefinição.",
    });
  } catch (err) {
    console.error("Erro em recuperar-senha:", err);
    res.status(500).json({ error: "Erro interno." });
  }
});

/**
 * POST /admin/reset-senha
 * Recebe token e nova senha, atualiza a senha do admin
 */
router.post("/reset-senha", async (req, res) => {
  try {
    const { token, novaSenha } = req.body;

    if (!token || !novaSenha) {
      return res.status(400).json({ error: "Token e nova senha são obrigatórios." });
    }

    // Verificar token JWT
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: "Token inválido ou expirado." });
    }

    const adminId = decoded.id;

    // Gerar hash da nova senha
    const senha_hash = await bcrypt.hash(novaSenha, 10);

    // Atualizar senha no banco
    const { error } = await supabase
      .from("administrador")
      .update({ senha_hash })
      .eq("id", adminId);

    if (error) throw error;

    res.json({ message: "Senha alterada com sucesso!" });
  } catch (err) {
    console.error("Erro em reset-senha:", err);
    res.status(500).json({ error: "Erro interno." });
  }
});


export default router;
