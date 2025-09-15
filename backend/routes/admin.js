import express from "express";
import { supabase } from "../db.js";
import { hashSenha } from "../utils/hash.js";
import { gerarToken } from "../utils/gerarToken.js"; 
import { v4 as uuidv4 } from "uuid";
import { enviarEmailAtivacao } from "../utils/mail.js"; // <-- importa aqui

const router = express.Router();

// Cadastro de aplicador pelo admin 
router.post("/criar-aplicador", async (req, res) => {
    try {
        const { nome, email, cargo } = req.body;

        // Checa se o usuário já existe
        const { data: usuarioExistente } = await supabase
            .from("usuarios")
            .select("*")
            .eq("email", email)
            .single();

        if (usuarioExistente) {
            return res.status(400).json({ erro: "Usuário já cadastrado" });
        }

        const senha_hash = await hashSenha("senhaTemporaria123");
        const token_ativacao = uuidv4();
        const agora = new Date();
        const token_expira_em = new Date(agora.getTime() + 24 * 60 * 60 * 1000); // 24 horas

        await supabase.from("usuarios").insert([{
            nome,
            email,
            cargo,
            ativo: false,
            senha_hash,
            token_ativacao,
            token_expira_em,
            ultimo_envio_token: agora
        }]);

        await enviarEmailAtivacao(email, token_ativacao);

        res.json({ mensagem: "Aplicador criado e email de ativação enviado." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao criar aplicador" });
    }
});

export default router;
