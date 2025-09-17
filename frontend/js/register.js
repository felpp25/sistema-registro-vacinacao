const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const messageDiv = document.getElementById("message");
const errorDiv = document.getElementById("error");

registerBtn.addEventListener("click", async () => {
  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  messageDiv.textContent = "";
  errorDiv.textContent = "";

  if (!nome || !email || !senha) {
    errorDiv.textContent = "Preencha todos os campos.";
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/admin/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha }),
    });

    const data = await res.json();

    if (res.ok) {
      messageDiv.textContent = data.message;
      registerBtn.style.display = "none";
      loginBtn.style.display = "block"; // mostra o botão de login
    } else {
      errorDiv.textContent = data.error || "Erro ao registrar.";
    }
  } catch (err) {
    console.error(err);
    errorDiv.textContent = "Erro na conexão com o servidor.";
  }
});

loginBtn.addEventListener("click", () => {
  window.location.href = "login.html";
});
