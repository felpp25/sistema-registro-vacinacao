import express from "express";
import { supabase } from "../db.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { enviarEmailAtivacao } from "../utils/mail.js";


const router = express.Router();

// 📌 Registrar novo aplicador
router.post("/register", async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    // Verifica se já existe usuário com este email
    const { data: userExists } = await supabase
      .from("usuarios")
      .select("id")
      .eq("email", email)
      .single();

    if (userExists) {
      return res.status(400).json({ error: "Email já cadastrado." });
    }

    // Cria hash da senha
    const senha_hash = await bcrypt.hash(senha, 10);

    // Gera token único de ativação
    const token = crypto.randomBytes(20).toString("hex");
    const agora = new Date();
    const token_expira_em = new Date(agora.getTime() + 24 * 60 * 60 * 1000); // 24h

    // Insere usuário no banco
    const { data, error } = await supabase
      .from("usuarios")
      .insert([
        {
          nome,
          email,
          senha_hash,
          ativo: false,
          token_ativacao: token,
          token_expira_em,
          ultimo_envio_token: agora,
        },
      ])
      .select();

    if (error || !data || data.length === 0) {
      throw error || new Error("Erro ao inserir usuário.");
    }

    // Envia email de ativação
    await enviarEmailAtivacao(email, token);

    res.status(201).json({
      message: "Usuário criado. Verifique seu email para ativar a conta.",
      userId: data[0].id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao registrar usuário." });
  }
});

// 📌 Ativar conta pelo token
router.get("/ativar", async (req, res) => {
  const { token } = req.query;

  try {
    const { data: user, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("token_ativacao", token)
      .single();

    if (error || !user) {
      return res.status(400).json({ error: "Token inválido." });
    }

    if (user.ativo) {
      return res.status(400).json({ error: "Conta já está ativada." });
    }

    if (new Date(user.token_expira_em) < new Date()) {
      return res.status(400).json({ error: "Token expirado." });
    }

    // Ativa conta e remove token
    await supabase
      .from("usuarios")
      .update({ ativo: true, token_ativacao: null, token_expira_em: null })
      .eq("id", user.id);

    res.status(200).json({ message: "Conta ativada com sucesso!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao ativar conta." });
  }
});

// 📌 Login do aplicador
router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  try {
    const { data: user, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(400).json({ error: "Usuário não encontrado." });
    }

    if (!user.ativo) {
      return res.status(403).json({ error: "Conta ainda não ativada." });
    }

    const validPassword = await bcrypt.compare(senha, user.senha_hash);
    if (!validPassword) {
      return res.status(401).json({ error: "Senha incorreta." });
    }

    // Aqui futuramente pode gerar JWT ou sessão
    res.status(200).json({ message: "Login realizado com sucesso!", userId: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao realizar login." });
  }
});

export default router;
