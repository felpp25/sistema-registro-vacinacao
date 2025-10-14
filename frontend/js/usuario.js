/* usuario.js — versão integrada com modal, validação e concluir/editar */

// configuração
const BASE = "http://localhost:3000";
const token = localStorage.getItem("token");
const cartaoVacina =
  new URLSearchParams(window.location.search).get("cartao_vacina") || "";

// redirect se não autenticado
if (!token) {
  window.location.href = "login.html";
}

// elementos do DOM principais (devem existir no HTML)
const vacinaSelect = document.getElementById("vacinaSelect");
const fabricanteInput = document.getElementById("fabricanteInput");
const mensagemErroDiv = document.getElementById("error");
const selectPosto = document.getElementById("posto");
const pendentesDiv = document.getElementById("pendentesList");
const concluidasDiv = document.getElementById("concluidasList");

const proxAplicacaoInput = document.getElementById("proxAplicacao");
const temRetornoCheckbox = document.getElementById("temRetornoCheckbox");

function formatarData(dataStr) {
  if (!dataStr) return "-";
  const [ano, mes, dia] = dataStr.split("-");
  return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR");
}

// helper fetch com token
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

/* ---------------- toggle proxAplicacao ---------------- */
function toggleProxAplicacao() {
  if (!proxAplicacaoInput || !temRetornoCheckbox) return;
  if (temRetornoCheckbox.checked) {
    proxAplicacaoInput.disabled = false;
    proxAplicacaoInput.classList.remove("bg-gray-100");
  } else {
    proxAplicacaoInput.disabled = true;
    proxAplicacaoInput.value = "";
    proxAplicacaoInput.classList.add("bg-gray-100");
  }
}
if (temRetornoCheckbox) {
  temRetornoCheckbox.addEventListener("change", toggleProxAplicacao);
  toggleProxAplicacao();
}

/* ---------------- carregar vacinas e postos ---------------- */
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
    vacinaSelect.innerHTML = '<option value="">Erro ao carregar vacinas</option>';
    mensagemErroDiv.textContent = "Erro ao carregar vacinas do servidor.";
  }
}
vacinaSelect?.addEventListener("change", () => {
  fabricanteInput.value = vacinaSelect.selectedOptions[0]?.dataset.fabricante || "";
});

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
    selectPosto.innerHTML = '<option value="">Erro ao carregar postos</option>';
    mensagemErroDiv.textContent = "Erro ao carregar postos do servidor.";
  }
}

/* ---------------- util validação data ---------------- */
function proxMaiorQueData(dataStr, proxStr) {
  if (!proxStr) return false;
  if (!dataStr) return false;
  const d = new Date(dataStr);
  const p = new Date(proxStr);
  // compara apenas a parte da data
  return p.setHours(0,0,0,0) > d.setHours(0,0,0,0);
}

/* ---------------- carregar usuario e listas ---------------- */
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
    document.getElementById("cartao").textContent = usuario.cartao_vacina || cartaoVacina;

    const avatarEl = document.getElementById("avatar");
    if (avatarEl) {
      avatarEl.src = usuario.foto_perfil_url || "https://via.placeholder.com/64?text=Perfil";
      avatarEl.alt = usuario.nome || "Usuário";
    }

    // limpar listas
    pendentesDiv.innerHTML = "";
    concluidasDiv.innerHTML = "";

    // preencher concluídas com base no status ou lógica
    (data.vacinas || []).forEach((v) => {
      const isPendente = v.status === "pendente" || (
        !v.status && (
          (v.prox_aplicacao && new Date(v.prox_aplicacao) > new Date(v.data_aplicacao)) ||
          (v.dose_tipo || "").toLowerCase().includes("retorno") ||
          (v.dose_tipo || "").toLowerCase().includes("pendente")
        )
      );

      const proxText = v.prox_aplicacao && v.data_aplicacao && new Date(v.prox_aplicacao) > new Date(v.data_aplicacao)
        ? `<p>Próx.: ${formatarData(v.prox_aplicacao)}</p>`
        : `<p>Próx.: -</p>`;

      // if concluded, append to concluídas list (no controls)
      if (!isPendente) {
        const card = document.createElement("div");
        card.className = "vacina-card bg-white p-4 rounded-lg shadow mb-3";
        card.innerHTML = `
          <p><strong>Vacinado:</strong></p>
          <h4>${v.vacinas?.nome || "-"} (${v.vacinas?.fabricante || "-"})</h4>
          <p>Dose: ${v.dose_tipo || "-"}</p>
          <p>Lote: ${v.lote || "-"}</p>
          <p>Data: ${v.data_aplicacao ? formatarData(v.data_aplicacao) : "-"}</p>
          ${proxText}
          <p>Posto: ${v.postos_vacinacao?.nome || "-"}</p>
          <p>Aplicador: ${v.aplicador?.nome || "-"}</p>
        `;
        concluidasDiv.appendChild(card);
      }
    });

    // agora renderiza pendentes com botões (editar/concluir)
    await carregarPendentes(cartaoVacina, data.vacinas || []);

  } catch (err) {
    mensagemErroDiv.textContent = err.message || "Erro ao carregar usuário";
  }
}

/* ---------------- carregarPendentes: renderiza pendentes com controles ----------------
   - cartaoVacina: string
   - vacinasCache: optional array (if provided, reuse instead of additional server call)
*/
async function carregarPendentes(cartaoVacinaParam, vacinasCache = null) {
  try {
    let vacinasList = vacinasCache;
    if (!vacinasList) {
      const data = await fetchAuth(`${BASE}/usuarios/${cartaoVacinaParam}`);
      vacinasList = data.vacinas || [];
    }

    pendentesDiv.innerHTML = "";

    // filter pendentes
    const pendentes = vacinasList.filter(v => {
      return v.status === "pendente" || (
        !v.status && (
          (v.prox_aplicacao && new Date(v.prox_aplicacao) > new Date(v.data_aplicacao)) ||
          (v.dose_tipo || "").toLowerCase().includes("retorno") ||
          (v.dose_tipo || "").toLowerCase().includes("pendente")
        )
      );
    });

    if (pendentes.length === 0) {
      pendentesDiv.innerHTML = '<p class="text-sm text-gray-500">Nenhuma vacina pendente.</p>';
      return;
    }

    pendentes.forEach((v) => {
      const proxText = v.prox_aplicacao && v.data_aplicacao && new Date(v.prox_aplicacao) > new Date(v.data_aplicacao)
        ? `<p>Próx.: ${formatarData(v.prox_aplicacao)}</p>`
        : `<p>Próx.: -</p>`;

      const card = document.createElement("div");
      card.className = "pendente-card bg-white p-4 rounded-lg shadow mb-3 flex flex-col gap-2";
      card.innerHTML = `
        <div>
          <p class="text-xs text-gray-500">Vacinado:</p>
          <h4 class="font-semibold">${v.vacinas?.nome || "-"} <span class="text-sm text-gray-400">(${v.vacinas?.fabricante || "-"})</span></h4>
          <p class="text-sm">Dose: ${v.dose_tipo || "-"}</p>
          <p class="text-sm">Lote: ${v.lote || "-"}</p>
          <p class="text-sm">Data: ${v.data_aplicacao ? formatarData(v.data_aplicacao) : "-"}</p>
          ${proxText}
          <p class="text-sm">Posto: ${v.postos_vacinacao?.nome || "-"}</p>
          <p class="text-sm">Aplicador: ${v.aplicador?.nome || "-"}</p>
        </div>
        <div class="flex gap-2 mt-3">
          <button data-id="${v.id}" class="btn-editar px-3 py-1 rounded bg-yellow-400 text-white">Editar</button>
          <button data-id="${v.id}" class="btn-concluir px-3 py-1 rounded bg-green-600 text-white">Concluir</button>
        </div>
      `;
      pendentesDiv.appendChild(card);
    });

    // attach listeners (delegation)
    pendentesDiv.querySelectorAll(".btn-editar").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = btn.getAttribute("data-id");
        abrirModalEditarVacina(id);
      });
    });
    pendentesDiv.querySelectorAll(".btn-concluir").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const id = btn.getAttribute("data-id");
        if (!confirm("Marcar esta vacina como concluída?")) return;
        try {
          const payload = {
            status: "concluida",
            prox_aplicacao: null,
            atualizado_em: new Date().toISOString()
          };
          await fetchAuth(`${BASE}/usuarioRegistrar/${id}`, {
            method: "PUT",
            body: JSON.stringify(payload),
          });
          // recarregar listas
          await carregarUsuario();
        } catch (err) {
          mensagemErroDiv.textContent = "Erro ao concluir vacina.";
        }
      });
    });

  } catch (err) {
    mensagemErroDiv.textContent = "Erro ao carregar vacinas pendentes.";
  }
}

/* ---------------- Modal editar (cria se não existir) ---------------- */
function ensureModalExists() {
  if (document.getElementById("modal-editar")) return;
  // cria um modal mínimo se não houver (para evitar quebrar)
  const template = document.createElement("div");
  template.innerHTML = `
    <div id="modal-editar" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/40">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 mx-4">
        <h3 class="text-xl font-semibold mb-4">Editar registro de vacina</h3>
        <form id="form-editar" class="space-y-4">
          <input type="hidden" id="editar-id" />
          <div><label class="block text-sm">Dose</label><input id="editar-dose" type="text" class="w-full border rounded px-3 py-2" /></div>
          <div><label class="block text-sm">Data</label><input id="editar-data" type="date" class="w-full border rounded px-3 py-2" /></div>
          <div><label class="block text-sm">Lote</label><input id="editar-lote" type="text" class="w-full border rounded px-3 py-2" /></div>
          <div class="flex items-center gap-3"><input id="editar-tem-retorno" type="checkbox" class="h-4 w-4" /><label for="editar-tem-retorno" class="text-sm">Tem retorno</label></div>
          <div><label class="block text-sm">Próx.</label><input id="editar-prox" type="date" class="w-full border rounded px-3 py-2 bg-gray-50" /></div>
          <div id="modal-error" class="text-sm text-red-500 hidden"></div>
          <div class="flex justify-end gap-3 mt-4">
            <button type="button" id="btn-cancelar-editar" class="px-4 py-2 rounded border">Cancelar</button>
            <button type="submit" id="btn-salvar-editar" class="px-4 py-2 rounded bg-pink-500 text-white">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.appendChild(template.firstElementChild);
}
ensureModalExists();

// obter elementos modal
const modalEditar = document.getElementById("modal-editar");
const formEditar = document.getElementById("form-editar");
const editarIdInput = document.getElementById("editar-id");
const editarDoseInput = document.getElementById("editar-dose");
const editarDataInput = document.getElementById("editar-data");
const editarLoteInput = document.getElementById("editar-lote");
const editarTemRetornoCheckbox = document.getElementById("editar-tem-retorno");
const editarProxInput = document.getElementById("editar-prox");
const btnCancelarEditar = document.getElementById("btn-cancelar-editar");
const modalErrorDiv = document.getElementById("modal-error");

// abrir modal e preencher
async function abrirModalEditarVacina(id) {
  try {
    const usuarioRes = await fetchAuth(`${BASE}/usuarios/${cartaoVacina}`);
    const registros = usuarioRes.vacinas || [];
    const registro = registros.find((r) => String(r.id) === String(id));
    if (!registro) {
      alert("Registro não encontrado para editar.");
      return;
    }

    editarIdInput.value = registro.id;
    editarDoseInput.value = registro.dose_tipo || "";
    editarDataInput.value = registro.data_aplicacao || "";
    editarLoteInput.value = registro.lote || "";
    editarProxInput.value = registro.prox_aplicacao || "";
    editarTemRetornoCheckbox.checked = !!registro.prox_aplicacao;
    editarProxInput.disabled = !editarTemRetornoCheckbox.checked;
    modalErrorDiv.classList.add("hidden");
    modalErrorDiv.textContent = "";

    modalEditar.classList.remove("hidden");
    modalEditar.classList.add("flex");
    editarDoseInput.focus();
  } catch (err) {
    alert("Erro ao abrir modal de edição.");
  }
}
function fecharModalEditar() {
  formEditar.reset();
  modalEditar.classList.remove("flex");
  modalEditar.classList.add("hidden");
  modalErrorDiv.classList.add("hidden");
  modalErrorDiv.textContent = "";
}
btnCancelarEditar.addEventListener("click", (e) => { e.preventDefault(); fecharModalEditar(); });
editarTemRetornoCheckbox.addEventListener("change", () => {
  if (editarTemRetornoCheckbox.checked) {
    editarProxInput.disabled = false;
    editarProxInput.classList.remove("bg-gray-50");
  } else {
    editarProxInput.disabled = true;
    editarProxInput.value = "";
    editarProxInput.classList.add("bg-gray-50");
    modalErrorDiv.classList.add("hidden");
    modalErrorDiv.textContent = "";
  }
});

/* validação reativa */
editarDataInput?.addEventListener("change", () => { modalErrorDiv.classList.add("hidden"); modalErrorDiv.textContent = ""; });
editarProxInput?.addEventListener("change", () => { modalErrorDiv.classList.add("hidden"); modalErrorDiv.textContent = ""; });

// submit modal -> PUT update
formEditar.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    const id = editarIdInput.value;
    if (!id) return alert("ID inválido.");

    const dataAplic = editarDataInput.value || null;
    const prox = editarTemRetornoCheckbox.checked ? (editarProxInput.value || null) : null;

    if (editarTemRetornoCheckbox.checked) {
      if (!prox) {
        modalErrorDiv.textContent = "Informe a data da próxima aplicação.";
        modalErrorDiv.classList.remove("hidden");
        return;
      }
      if (!proxMaiorQueData(dataAplic, prox)) {
        modalErrorDiv.textContent = "A próxima aplicação deve ser posterior à data de aplicação.";
        modalErrorDiv.classList.remove("hidden");
        return;
      }
    }

    const payload = {};
    if (editarDoseInput.value !== null) payload.dose_tipo = editarDoseInput.value;
    if (dataAplic) payload.data_aplicacao = dataAplic;
    payload.lote = editarLoteInput.value === "" ? null : editarLoteInput.value;
    if (editarTemRetornoCheckbox.checked) {
      payload.prox_aplicacao = prox;
      payload.tem_retorno = true;
      // leave status as-is
    } else {
      payload.prox_aplicacao = null;
      payload.tem_retorno = false;
    }
    payload.atualizado_em = new Date().toISOString();

    await fetchAuth(`${BASE}/usuarioRegistrar/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    fecharModalEditar();
    await carregarUsuario();
    await carregarPendentes(cartaoVacina);
    alert("Registro atualizado com sucesso.");
  } catch (err) {
    modalErrorDiv.textContent = "Erro ao salvar edição.";
    modalErrorDiv.classList.remove("hidden");
  }
});
modalEditar.addEventListener("click", (e) => { if (e.target === modalEditar) fecharModalEditar(); });

/* ---------------- Formulário principal: validação antes do POST ---------------- */
const vacinaForm = document.getElementById("vacinaForm");
const dataAplicInput = document.getElementById("dataAplicacao");

vacinaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    mensagemErroDiv.textContent = "";

    const dataAplic = dataAplicInput.value || null;
    const temRetorno = temRetornoCheckbox && temRetornoCheckbox.checked;
    const proxVal = temRetorno ? (proxAplicacaoInput.value || null) : null;

    if (temRetorno) {
      if (!proxVal) {
        mensagemErroDiv.textContent = "Se marcou retorno, informe a data da próxima aplicação.";
        return;
      }
      if (!proxMaiorQueData(dataAplic, proxVal)) {
        mensagemErroDiv.textContent = "A próxima aplicação deve ser posterior à data de aplicação.";
        return;
      }
    }

    const payload = {
      cartao_vacina: cartaoVacina,
      vacina_id: parseInt(vacinaSelect.value),
      data_aplicacao: dataAplic,
      dose_tipo: document.getElementById("doseTipo").value,
      lote: document.getElementById("lote").value || null,
      prox_aplicacao: proxVal,
      posto_id: selectPosto.value || null,
      campanha_id: null,
      tem_retorno: temRetorno ? true : false,
      status: temRetorno ? "pendente" : "concluida",
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString()
    };

    await fetchAuth(`${BASE}/usuarioRegistrar`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    e.target.reset();
    if (temRetornoCheckbox) temRetornoCheckbox.checked = false;
    toggleProxAplicacao();

    await carregarUsuario();
  } catch (err) {
    mensagemErroDiv.textContent = err.message || "Erro ao registrar vacina";
  }
});

/* ---------------- inicialização ---------------- */
(async function init() {
  await carregarVacinas();
  await carregarPostos();
  await carregarUsuario();
})();
