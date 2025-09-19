const BASE = "http://localhost:3000";
const token = localStorage.getItem("token");
const cartaoVacina =
  new URLSearchParams(window.location.search).get("cartao_vacina") || "";

// Redireciona para login se não houver token
if (!token) {
  window.location.href = "login.html";
}

const vacinaSelect = document.getElementById("vacinaSelect");
const fabricanteInput = document.getElementById("fabricanteInput");
const mensagemErroDiv = document.getElementById("error");
const selectPosto = document.getElementById("posto");
const pendentesDiv = document.getElementById("pendentesList");
const concluidasDiv = document.getElementById("concluidasList");

function formatarData(dataStr) {
  if (!dataStr) return "-";
  const [ano, mes, dia] = dataStr.split("-");
  return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR");
}

// Helper para fetch com token
async function fetchAuth(url, options = {}) {
  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const res = await fetch(url, options);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || "Erro na requisição");
  }
  return res.json();
}

// Carregar vacinas
async function carregarVacinas() {
  try {
    const vacinas = await fetchAuth(`${BASE}/vacinas`);
    vacinaSelect.innerHTML = '<option value="">Selecione a vacina</option>';
    vacinas.forEach((v) => {
      const option = document.createElement("option");
      option.value = v.id;
      option.textContent = `${v.nome}${v.fabricante ? " (" + v.fabricante + ")" : ""}`;
      option.dataset.fabricante = v.fabricante || "";
      vacinaSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Erro ao carregar vacinas:", err);
    vacinaSelect.innerHTML = '<option value="">Erro ao carregar vacinas</option>';
    mensagemErroDiv.textContent = "Erro ao carregar vacinas do servidor.";
  }
}

vacinaSelect.addEventListener("change", () => {
  fabricanteInput.value =
    vacinaSelect.selectedOptions[0]?.dataset.fabricante || "";
});

// Carregar postos
async function carregarPostos() {
  try {
    const postos = await fetchAuth(`${BASE}/postos/lista`);
    selectPosto.innerHTML = '<option value="">Selecione o posto</option>';
    postos.forEach((p) => {
      const option = document.createElement("option");
      option.value = p.id;
      option.textContent = p.nome;
      selectPosto.appendChild(option);
    });
  } catch (err) {
    console.error("Erro ao listar postos:", err);
    selectPosto.innerHTML = '<option value="">Erro ao carregar postos</option>';
    mensagemErroDiv.textContent = "Erro ao carregar postos do servidor.";
  }
}

// Carregar usuário e vacinas
async function carregarUsuario() {
  if (!cartaoVacina) return;
  try {
    const data = await fetchAuth(`${BASE}/usuarios/${cartaoVacina}`);
    const usuario = data.usuario || data;

    document.getElementById("nome").textContent = usuario.nome || "-";
    document.getElementById("nascimento").textContent = usuario.data_nascimento
      ? formatarData(usuario.data_nascimento)
      : "-";
    document.getElementById("sexo").textContent = usuario.sexo || "-";
    document.getElementById("cartao").textContent =
      usuario.cartao_vacina || cartaoVacina;

    const avatarEl = document.getElementById("avatar");
    avatarEl.src =
      usuario.foto_perfil_url || "https://via.placeholder.com/64?text=Perfil";
    avatarEl.alt = usuario.nome || "Usuário";

    pendentesDiv.innerHTML = "";
    concluidasDiv.innerHTML = "";

    (data.vacinas || []).forEach((v) => {
      const card = document.createElement("div");
      const proxFuture = v.prox_aplicacao
        ? new Date(v.prox_aplicacao) > new Date()
        : false;
      const doseLower = (v.dose_tipo || "").toLowerCase();
      const isPendente =
        proxFuture ||
        doseLower.includes("1ª") ||
        doseLower.includes("retorno") ||
        doseLower.includes("pendente");

      card.className = isPendente ? "pendente-card" : "vacina-card";
      card.innerHTML = `
        <h4>${v.vacinas?.nome || "-"} (${v.dose_tipo || "-"})</h4>
        <p>Data: ${v.data_aplicacao ? formatarData(v.data_aplicacao) : "-"}</p>
        <p>Posto: ${v.postos_vacinacao?.nome || "-"}</p>
        <p>Lote: ${v.lote || "-"}</p>
        <p>Aplicador: ${v.aplicador?.nome || "-"}</p>
      `;
      if (isPendente) pendentesDiv.appendChild(card);
      else concluidasDiv.appendChild(card);
    });
  } catch (err) {
    console.error("Erro carregarUsuario:", err);
    mensagemErroDiv.textContent = err.message || "Erro ao carregar usuário";
  }
}

// Registrar vacina
document.getElementById("vacinaForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    mensagemErroDiv.textContent = "";

    const payload = {
      cartao_vacina: cartaoVacina,
      vacina_id: parseInt(vacinaSelect.value),
      data_aplicacao: document.getElementById("dataAplicacao").value,
      dose_tipo: document.getElementById("doseTipo").value,
      lote: document.getElementById("lote").value || null,
      prox_aplicacao: document.getElementById("proxAplicacao").value || null,
      posto_id: selectPosto.value || null,
      campanha_id: null,
    };

    await fetchAuth(`${BASE}/usuariosregistrar`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    e.target.reset();
    await carregarUsuario();
  } catch (err) {
    console.error("Erro registrar vacina:", err);
    mensagemErroDiv.textContent = err.message || "Erro ao registrar vacina";
  }
});

// Inicializar
(async function init() {
  await carregarVacinas();
  await carregarPostos();
  await carregarUsuario();
})();
