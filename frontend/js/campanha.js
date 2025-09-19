let dadosTemporarios = {};
let campanhaExistenteHoje = null;
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

const vacinaSelect = document.getElementById("vacina");
const fabricanteInput = document.getElementById("fabricante");
const mensagemErroDiv = document.getElementById("mensagem-erro");
const btnGerar = document.getElementById("btn-gerar");

// Botão "Visualizar Campanha Existente"
const btnVisualizar = document.createElement("button");
btnVisualizar.innerText = "Visualizar Campanha Existente";
btnVisualizar.style.display = "none";
btnVisualizar.classList.add("btn", "btn-secondary");
btnVisualizar.addEventListener("click", () => {
  if (campanhaExistenteHoje) exibirQRCode(campanhaExistenteHoje);
});
document.getElementById("formulario").appendChild(btnVisualizar);

/**
 * Função para requisições autenticadas
 */
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

/**
 * Carregar vacinas no select
 */
async function carregarVacinas() {
  try {
    const vacinas = await fetchAuth("http://localhost:3000/vacinas");
    vacinaSelect.innerHTML = '<option value="">Selecione a vacina</option>';
    vacinas.forEach(v => {
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

vacinaSelect.addEventListener("change", () => {
  const fabricante = vacinaSelect.selectedOptions[0]?.dataset.fabricante || "";
  fabricanteInput.value = fabricante;
});

/**
 * Exibir QR Code da campanha
 */
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
  btnVisualizar.style.display = "none";
}

/**
 * Verificar se já existe campanha hoje
 */
async function verificarCampanhaHoje() {
  try {
    const result = await fetchAuth("http://localhost:3000/campanhas/hoje");
    if (result.existe && result.campanhas.length > 0) {
      campanhaExistenteHoje = result.campanhas[0];

      mensagemErroDiv.style.display = "block";
      mensagemErroDiv.innerText = "Já existe uma campanha ativa hoje.";

      btnVisualizar.style.display = "inline-block";
    }
  } catch (err) {
    console.error("Erro ao verificar campanha existente:", err);
  }
}

/**
 * Criar nova campanha
 * ⚠️ Alert só aparece se o backend bloquear duplicata
 */
btnGerar.addEventListener("click", async () => {
  const vacina_id = vacinaSelect.value;
  const dose = document.getElementById("dose").value.trim();

  if (!vacina_id || !dose) {
    mensagemErroDiv.style.display = "block";
    mensagemErroDiv.innerText = "Preencha todos os campos antes de gerar o QR Code.";
    return;
  }

  try {
    const result = await fetchAuth("http://localhost:3000/campanhas", {
      method: "POST",
      body: JSON.stringify({ vacina_id, dose }),
    });
    exibirQRCode(result.campanha);
  } catch (err) {
    if (err.message.includes("Já existe um QR Code gerado para hoje")) {
      alert("⚠️ Já existe uma campanha ativa hoje. Você não pode criar outra.");
    } else {
      console.error("Erro:", err);
      mensagemErroDiv.style.display = "block";
      mensagemErroDiv.innerText = "Erro ao comunicar com o servidor.";
    }
  }
});

/**
 * Encerrar campanha
 */
async function encerrarCampanha() {
  if (!dadosTemporarios.id) return;

  try {
    await fetchAuth(`http://localhost:3000/campanhas/${dadosTemporarios.id}/encerrar`, { method: "POST" });
    alert("✅ Campanha encerrada com sucesso!");
    location.reload();
  } catch (err) {
    console.error(err);
    alert("Erro ao comunicar com o servidor.");
  }
}

/**
 * Imprimir QR Code
 */
function imprimirQRCode() {
  window.print();
}

// Inicialização
carregarVacinas();
verificarCampanhaHoje();
