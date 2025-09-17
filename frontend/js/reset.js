const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("token");

const form = document.getElementById("resetForm");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const novaSenha = document.getElementById("novaSenha").value;

  const res = await fetch("http://localhost:3000/admin/reset-senha", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, novaSenha }),
  });
  const data = await res.json();
  alert(data.message);
  if (!data.error) {
    window.location.href = "login.html";
  }
});
