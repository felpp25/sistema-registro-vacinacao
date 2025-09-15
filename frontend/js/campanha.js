let dadosTemporarios = {};

const vacinaSelect = document.getElementById("vacina");
const fabricanteInput = document.getElementById("fabricante");
const mensagemErroDiv = document.getElementById("mensagem-erro");
const btnGerar = document.getElementById("btn-gerar");

// Carregar vacinas do backend
async function carregarVacinas() {
  try {
    const res = await fetch("http://localhost:3000/vacinas");
    const vacinas = await res.json();

    vacinaSelect.innerHTML = '<option value="">Selecione a vacina</option>';
    vacinas.forEach((v) => {
      const option = document.createElement("option");
      option.value = v.id; // envia o id da vacina
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

// Gerar QR Code
btnGerar.addEventListener("click", async () => {
  const vacina_id = vacinaSelect.value;
  const dose = document.getElementById("dose").value.trim();
  const aplicador = document.getElementById("aplicador").value.trim();

  if (!vacina_id || !dose || !aplicador) {
    mensagemErroDiv.style.display = "block";
    mensagemErroDiv.innerText =
      "Preencha todos os campos antes de gerar o QR Code.";
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/campanhas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vacina_id, dose, aplicador }),
    });

    const result = await response.json();

    if (!response.ok) {
      mensagemErroDiv.style.display = "block";
      mensagemErroDiv.innerText = result.error || "Erro ao criar QR Code.";
      return;
    }

    dadosTemporarios = result.campanha;
    document.getElementById("formulario").style.display = "none";
    document.getElementById("qrcode-container").style.display = "block";

    document.getElementById("qrcode").innerHTML = "";
    new QRCode(document.getElementById("qrcode"), {
      text: `http://localhost:3000/campanhas/${dadosTemporarios.id}`,
      width: document.getElementById("qrcode").clientWidth,
      height: document.getElementById("qrcode").clientWidth,
    });

    mensagemErroDiv.style.display = "none";
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
    const response = await fetch(
      `http://localhost:3000/campanhas/${dadosTemporarios.id}/encerrar`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );

    const result = await response.json();

    if (response.ok) {
      alert("✅ Campanha encerrada com sucesso!");
      location.reload();
    } else {
      alert(result.error || "Erro ao encerrar campanha.");
    }
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
