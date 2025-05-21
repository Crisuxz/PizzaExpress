document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    const navbarOpciones = document.getElementById("navbarOpciones");
    if (!navbarOpciones) return;
    navbarOpciones.innerHTML = "";

    // Simulación de sesión: localStorage.usuarioActual y localStorage.isAdmin
    // isAdmin debe ser "true" (string) si es admin

    const usuario = localStorage.getItem("usuarioActual");
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (usuario && isAdmin) {
      // --- NAVBAR ADMIN ---
      // Panel Admin
      const liPanel = document.createElement("li");
      liPanel.className = "nav-item";
      const aPanel = document.createElement("a");
      aPanel.className = "nav-link text-light";
      aPanel.href = "admin.html";
      aPanel.textContent = "Panel Admin";
      liPanel.appendChild(aPanel);

      // Mis Pedidos
      const liPedidos = document.createElement("li");
      liPedidos.className = "nav-item";
      const aPedidos = document.createElement("a");
      aPedidos.className = "nav-link text-light";
      aPedidos.href = "pedidos.html";
      aPedidos.textContent = "Mis Pedidos";
      liPedidos.appendChild(aPedidos);

      // Nombre admin
      const liUsuario = document.createElement("li");
      liUsuario.className = "nav-item";
      const spanUsuario = document.createElement("span");
      spanUsuario.className = "nav-link text-light fw-bold";
      spanUsuario.textContent = usuario + " (Admin)";
      liUsuario.appendChild(spanUsuario);

      // Cerrar sesión
      const liLogout = document.createElement("li");
      liLogout.className = "nav-item";
      const btnLogout = document.createElement("button");
      btnLogout.className = "btn btn-light text-danger rounded-2 nav-link";
      btnLogout.textContent = "Cerrar Sesión";
      btnLogout.onclick = function () {
        localStorage.removeItem("usuarioActual");
        localStorage.removeItem("isAdmin");
        window.location.href = "login.html";
      };
      liLogout.appendChild(btnLogout);

      navbarOpciones.appendChild(liPanel);
      navbarOpciones.appendChild(liPedidos);
      navbarOpciones.appendChild(liUsuario);
      navbarOpciones.appendChild(liLogout);

    } else if (usuario) {
      // --- NAVBAR USUARIO LOGUEADO ---
      // Mi Carrito
      const liCarrito = document.createElement("li");
      liCarrito.className = "nav-item";
      const aCarrito = document.createElement("a");
      aCarrito.className = "nav-link text-light";
      aCarrito.href = "carrito.html";
      aCarrito.textContent = "Mi Carrito";
      liCarrito.appendChild(aCarrito);

      // Mis Pedidos
      const liPedidos = document.createElement("li");
      liPedidos.className = "nav-item";
      const aPedidos = document.createElement("a");
      aPedidos.className = "nav-link text-light";
      aPedidos.href = "pedidos.html";
      aPedidos.textContent = "Mis Pedidos";
      liPedidos.appendChild(aPedidos);

      // Nombre usuario
      const liUsuario = document.createElement("li");
      liUsuario.className = "nav-item";
      const spanUsuario = document.createElement("span");
      spanUsuario.className = "nav-link text-light fw-bold";
      spanUsuario.textContent = usuario;
      liUsuario.appendChild(spanUsuario);

      // Cerrar sesión
      const liLogout = document.createElement("li");
      liLogout.className = "nav-item";
      const btnLogout = document.createElement("button");
      btnLogout.className = "btn btn-light text-danger rounded-2 nav-link";
      btnLogout.textContent = "Cerrar Sesión";
      btnLogout.onclick = function () {
        localStorage.removeItem("usuarioActual");
        localStorage.removeItem("isAdmin");
        window.location.href = "login.html";
      };
      liLogout.appendChild(btnLogout);

      navbarOpciones.appendChild(liCarrito);
      navbarOpciones.appendChild(liPedidos);
      navbarOpciones.appendChild(liUsuario);
      navbarOpciones.appendChild(liLogout);

    } else {
      // --- NAVBAR NO LOGUEADO ---
      const opciones = [
        { href: "menu.html", text: "Menú" },
        { href: "login.html", text: "Iniciar Sesión" },
        { href: "registro.html", text: "Registrarse", btn: true }
      ];
      opciones.forEach(op => {
        const li = document.createElement("li");
        li.className = "nav-item";
        if (op.btn) {
          const a = document.createElement("a");
          a.href = op.href;
          a.className = "btn btn-light text-danger rounded-2 nav-link";
          a.textContent = op.text;
          li.appendChild(a);
        } else {
          const a = document.createElement("a");
          a.href = op.href;
          a.className = "nav-link text-light";
          a.textContent = op.text;
          li.appendChild(a);
        }
        navbarOpciones.appendChild(li);
      });
    }
  }, 200);
});