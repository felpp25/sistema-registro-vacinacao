// authCheck.js

// Função para pegar token do localStorage
export function getToken() {
  return localStorage.getItem("token");
}

// Função para redirecionar para login se não houver token
export function ensureAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = "index.html";
    return false;
  }
  return true;
}

// Função para fazer fetch com token incluído
export async function fetchWithAuth(url, options = {}) {
  const token = getToken();
  if (!token) {
    throw new Error("Usuário não autenticado.");
  }

  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || "Erro na requisição autenticada.");
  }
  return res.json();
}
