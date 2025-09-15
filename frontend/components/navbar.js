document.addEventListener("DOMContentLoaded", () => {
  fetch("./components/navbar.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("navbar-container").innerHTML = data;
    })
    .catch(error => console.error("Erro ao carregar navbar:", error));
});
