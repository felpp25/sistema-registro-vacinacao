const loginBtn = document.getElementById("loginBtn");
const errorMsg = document.getElementById("errorMsg");

loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  if (!email || !senha) {
    errorMsg.textContent = "Preencha todos os campos.";
    return;
  }

  try {
    const response = await fetch(
      "https://carteiravacinadigitalweb.onrender.com/admin/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      // Salvar token no localStorage
      localStorage.setItem("token", data.token);
      // Redirecionar para menu.html
      window.location.href = "menu.html";
    } else {
      errorMsg.textContent = data.error || "Erro ao fazer login.";
    }
  } catch (err) {
    errorMsg.textContent = "Erro de conexão com o servidor.";
    console.error(err);
  }
});
