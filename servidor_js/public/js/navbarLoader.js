function getUserType() {
  const usuario = localStorage.getItem("usuarioActual");
  if (!usuario) return "guest";
  const admins = [
    "admin1@pizzeria.com",
    "admin2@pizzeria.com",
    "admin3@pizzeria.com"
  ];
  if (admins.includes(usuario)) return "admin";
  return "user";
}

function loadNavbar() {
  let navbarFile = "navbar.html";
  const tipo = getUserType();
  if (tipo === "user") navbarFile = "navbar_user.html";
  if (tipo === "admin") navbarFile = "navbar_admin.html";

  fetch(navbarFile)
    .then(res => res.text())
    .then(data => {
      document.getElementById('navbar').innerHTML = data;

      // Mostrar el nombre real del usuario/admin después de insertar la navbar
      const nombre = localStorage.getItem("nombreUsuario");
      const nombreSpan = document.getElementById("nombreUsuario");
      if (nombreSpan) {
        nombreSpan.textContent = nombre ? nombre : "";
      }

      // Si hay botón de logout, asígnale funcionalidad
      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
          e.preventDefault();
          localStorage.removeItem("usuarioActual");
          localStorage.removeItem("nombreUsuario");
          window.location.href = "login.html";
        });
      }
    });
}

document.addEventListener("DOMContentLoaded", loadNavbar);