// Mostrar/Esconder senha
const senhaInput = document.getElementById("novaSenha");
const toggleSenha = document.getElementById("toggleSenha");
toggleSenha.addEventListener("click", () => {
  if (senhaInput.type === "password") {
    senhaInput.type = "text";
    toggleSenha.textContent = "🙉";
  } else {
    senhaInput.type = "password";
    toggleSenha.textContent = "🙈";
  }
});

// Pega token da URL
const token = new URLSearchParams(window.location.search).get("token");
const mensagemDiv = document.getElementById("mensagem");
const resetBtn = document.getElementById("resetBtn");

resetBtn.addEventListener("click", async () => {
  const novaSenha = senhaInput.value.trim();

  // Validação de senha
  if (!novaSenha) {
    mensagemDiv.textContent = "Digite a nova senha.";
    return;
  }
  if (novaSenha.length < 8) {
    mensagemDiv.textContent = "A senha precisa ter no mínimo 8 caracteres.";
    return;
  }
  if (!token) {
    mensagemDiv.textContent = "Token inválido.";
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/admin/reset-senha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, novaSenha }),
    });

    const data = await res.json();
    if (res.ok) {
      mensagemDiv.classList.remove("text-red-500");
      mensagemDiv.classList.add("text-green-500");
      mensagemDiv.textContent = "Senha alterada com sucesso!";
      senhaInput.value = "";
    } else {
      mensagemDiv.textContent = data.error || "Erro ao alterar senha.";
    }
  } catch (err) {
    console.error(err);
    mensagemDiv.textContent = "Erro de conexão com o servidor.";
  }
});
