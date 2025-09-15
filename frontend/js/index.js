const modal = document.getElementById('modalBuscar');
  const abrirModalBtn = document.getElementById('buscarRegistrarBtn');
  const fecharModalBtn = document.getElementById('closeModal');
  const buscarBtn = document.getElementById('buscarBtn');
  const cartaoInput = document.getElementById('cartaoInput');

  abrirModalBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
    cartaoInput.focus();
  });

  fecharModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  buscarBtn.addEventListener('click', () => {
    const cartao = cartaoInput.value.trim();
    if (!cartao) {
      alert('Digite o número do cartão de vacinação');
      return;
    }
    window.location.href = `usuario.html?cartao_vacina=${cartao}`;
  });

  cartaoInput.addEventListener('keypress', (e) => {
    if(e.key === 'Enter') buscarBtn.click();
  });