let dadosTemporarios = {};
const token = localStorage.getItem("token");

// Redireciona para login se não houver token
if (!token) {
  window.location.href = "login.html";
}

const vacinaSelect = document.getElementById("vacina");
const fabricanteInput = document.getElementById("fabricante");
const mensagemErroDiv = document.getElementById("mensagem-erro");
const aplicadorInput = document.getElementById("aplicador");
const btnGerar = document.getElementById("btn-gerar");

// Helper fetch com token
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

// Carregar vacinas do backend
async function carregarVacinas() {
  try {
    const vacinas = await fetchAuth("http://localhost:3000/vacinas");

    vacinaSelect.innerHTML = '<option value="">Selecione a vacina</option>';
    vacinas.forEach((v) => {
      const option = document.createElement("option");
      option.value = v.id;
      option.text = `${v.nome} (${v.fabricante})`;
      option.dataset.fabricante = v.fabricante;
      vacinaSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Erro ao carregar vacinas:", err);
    mensagemErroDiv.style.display = "block";
    mensagemErroDiv.innerText = "Erro ao carregar vacinas do servidor.";
  }
}

// Atualiza fabricante ao selecionar vacina
vacinaSelect.addEventListener("change", () => {
  const fabricante = vacinaSelect.selectedOptions[0]?.dataset.fabricante || "";
  fabricanteInput.value = fabricante;
});

// Exibir QR Code
function exibirQRCode(campanha) {
  dadosTemporarios = campanha;
  document.getElementById("formulario").style.display = "none";
  document.getElementById("qrcode-container").style.display = "block";

  document.getElementById("qrcode").innerHTML = "";
  new QRCode(document.getElementById("qrcode"), {
    text: `http://localhost:3000/campanhas/${campanha.id}`,
    width: document.getElementById("qrcode").clientWidth,
    height: document.getElementById("qrcode").clientWidth,
  });

  mensagemErroDiv.style.display = "none";
}

// Verifica se já existe campanha para o aplicador
aplicadorInput.addEventListener("blur", async () => {
  const aplicador = aplicadorInput.value.trim();
  if (!aplicador) return;

  try {
    const result = await fetchAuth(
      `http://localhost:3000/campanhas/hoje?aplicador=${encodeURIComponent(aplicador)}`
    );

    if (result.existe && result.campanhas.length > 0) {
      alert("Já existe uma campanha ativa para este aplicador hoje. Exibindo o QR Code existente.");
      exibirQRCode(result.campanhas[0]);
    }
  } catch (err) {
    console.error("Erro ao verificar campanha existente:", err);
  }
});

// Gerar QR Code
btnGerar.addEventListener("click", async () => {
  const vacina_id = vacinaSelect.value;
  const dose = document.getElementById("dose").value.trim();
  const aplicador = aplicadorInput.value.trim();

  if (!vacina_id || !dose || !aplicador) {
    mensagemErroDiv.style.display = "block";
    mensagemErroDiv.innerText = "Preencha todos os campos antes de gerar o QR Code.";
    return;
  }

  try {
    const result = await fetchAuth("http://localhost:3000/campanhas", {
      method: "POST",
      body: JSON.stringify({ vacina_id, dose, aplicador }),
    });

    exibirQRCode(result.campanha);
  } catch (err) {
    console.error("Erro:", err);
    mensagemErroDiv.style.display = "block";
    mensagemErroDiv.innerText = "Erro ao comunicar com o servidor.";
  }
});

// Encerrar campanha
async function encerrarCampanha() {
  if (!dadosTemporarios.id) return;

  try {
    const result = await fetchAuth(
      `http://localhost:3000/campanhas/${dadosTemporarios.id}/encerrar`,
      { method: "POST" }
    );

    alert("✅ Campanha encerrada com sucesso!");
    location.reload();
  } catch (err) {
    console.error(err);
    alert("Erro ao comunicar com o servidor.");
  }
}

function imprimirQRCode() {
  window.print();
}

// Inicializa
carregarVacinas();
