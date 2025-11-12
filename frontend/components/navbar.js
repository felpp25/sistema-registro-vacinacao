document.addEventListener("DOMContentLoaded", () => {
  // Carrega o HTML da navbar
  fetch("/components/navbar.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("navbar-container").innerHTML = data;

      // Define a visibilidade dos botões conforme a página
      const page = document.body.dataset.page;

      const logoutBtn = document.getElementById("logoutBtn");
      const registerBtn = document.getElementById("registerBtn");
      const loginBtn = document.getElementById("loginBtn");
      const incioBtn = document.getElementById("inicioBtn");

      if (page === "login") {
        registerBtn.classList.remove("hidden");
        loginBtn.classList;
      } else if (page === "register") {
        loginBtn.classList.remove("hidden");
      } else if (page === "reset") {
        logoutBtn.classList.remove("hidden");
      } else if (page === "recuperar") {
        loginBtn.classList.remove("hidden");
      } else {
        logoutBtn.classList.remove("hidden");
      }

      if (page === "index") {
        incioBtn.classList.remove("hidden");
      }

      // Logout
      if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
          localStorage.removeItem("token");
          window.location.href = "index.html";
        });
      }
    })
    .catch((error) => console.error("Erro ao carregar navbar:", error));
});
