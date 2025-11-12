// index.js - Lógica do menu principal

// --- Verificação de login ---
const token = localStorage.getItem("token");
if (!token) {
  // Se não houver token, redireciona para login
  window.location.href = "index.html";
}

// --- Logout ---
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token"); // remove token
    window.location.href = "index.html"; // redireciona
  });
}

// --- Modal de Buscar Usuário ---
const modal = document.getElementById("modalBuscar");
const abrirModalBtn = document.getElementById("buscarRegistrarBtn");
const fecharModalBtn = document.getElementById("closeModal");
const buscarBtn = document.getElementById("buscarBtn");
const cartaoInput = document.getElementById("cartaoInput");

if (abrirModalBtn && modal) {
  abrirModalBtn.addEventListener("click", () => {
    modal.style.display = "flex";
    cartaoInput.focus();
  });
}

if (fecharModalBtn && modal) {
  fecharModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });
}

// Fechar modal clicando fora dele
window.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

// Ação do botão buscar
if (buscarBtn) {
  buscarBtn.addEventListener("click", () => {
    const cartao = cartaoInput.value.trim();
    if (!cartao) {
      alert("Digite o número do cartão de vacinação");
      return;
    }
    // Redireciona para a página de usuário com o parâmetro
    window.location.href = `usuario.html?cartao_vacina=${cartao}`;
  });
}

// Enter no input dispara o botão buscar
if (cartaoInput) {
  cartaoInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") buscarBtn.click();
  });
}
