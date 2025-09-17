document.addEventListener("DOMContentLoaded", () => {
  fetch("./components/navbar.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("navbar-container").innerHTML = data;

      // Só executa a lógica depois da navbar estar carregada
      const path = window.location.pathname;

      const logoutBtn = document.getElementById("logoutBtn");
      const registerBtn = document.getElementById("registerBtn");
      const loginBtn = document.getElementById("loginBtn");

      if (path.includes("login.html")) {
        registerBtn.classList.remove("hidden"); // mostra Registrar
      } 
      else if (path.includes("register.html")) {
        loginBtn.classList.remove("hidden"); // mostra Login
      } 
      else if (path.includes("reset.html")) {
        logoutBtn.classList.remove("hidden"); // mostra Sair
      } 
      else if (path.includes("recuperar.html")) {
        loginBtn.classList.remove("hidden"); // mostra Login
      } 
      else {
        logoutBtn.classList.remove("hidden"); // nas páginas internas
      }

      // 🔹 Ação de logout
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          localStorage.removeItem("token");
          window.location.href = "login.html";
        });
      }
    })
    .catch(error => console.error("Erro ao carregar navbar:", error));
});
