import nodemailer from "nodemailer";

/**
 * Envia email de ativação para o usuário
 * @param {string} email - Email do destinatário
 * @param {string} token - Token de ativação
 * @returns {Promise<Object>} Info do email enviado
 */
export async function enviarEmailAtivacao(email, token) {
  // Cria conta de teste no Ethereal (dev only)
  const testAccount = await nodemailer.createTestAccount();

  // Configura o transporter
  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure, // true para 465, false para outras portas
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  // Link de ativação (ajuste localhost se usar ngrok ou servidor real)
  const link = `http://localhost:3000/auth/ativar?token=${token}`;

  // Envia o email
  const info = await transporter.sendMail({
    from: '"Sistema Vacinação" <no-reply@sistemavacinacao.com>',
    to: email,
    subject: "Ative sua conta",
    html: `
      <p>Olá,</p>
      <p>Clique no link abaixo para ativar sua conta:</p>
      <a href="${link}">${link}</a>
      <p>Se você não solicitou este acesso, ignore este email.</p>
    `,
  });

  console.log("✅ Email de ativação gerado.");
  console.log("🔗 Preview URL: " + nodemailer.getTestMessageUrl(info));

  return info;
}
