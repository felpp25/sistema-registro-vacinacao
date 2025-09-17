const form = document.getElementById("recuperarForm");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;

  const res = await fetch("http://localhost:3000/admin/recuperar-senha", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  alert(data.message);
});
