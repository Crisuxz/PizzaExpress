  // Hacer la función accesible globalmente
  window.agregarAlCarrito = function(pizza) {
    if (!localStorage.getItem("usuarioLogueado")) {
      localStorage.setItem("pizzaPendiente", pizza);
      window.location.href = "registro.html";
    } else {
      let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
      carrito.push(pizza);
      localStorage.setItem("carrito", JSON.stringify(carrito));
      alert("Pizza agregada al carrito");
    }
  };
  // Verifica si el usuario ha iniciado sesión
  function isUserLoggedIn() {
    return localStorage.getItem("usuarioActual") !== null;
  }

  // Guarda la pizza seleccionada y redirige si es necesario
  function handleAgregarPedido(nombrePizza) {
    localStorage.setItem("pizzaSeleccionada", nombrePizza);

    if (!isUserLoggedIn()) {
      // Redirige a registro si no ha iniciado sesión
      window.location.href = "login.html";
    } else {
      // Usuario logueado: agregar al carrito
      agregarAlCarrito(nombrePizza);
      alert(nombrePizza + " fue agregada al carrito.");
    }
  }
  // Agrega al carrito
  function agregarAlCarrito(nombrePizza) {
    
    var carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito.push({ nombre: nombrePizza });
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }
  // Asocia los botones a su evento
  document.addEventListener("DOMContentLoaded", function () {
    var botones = document.querySelectorAll("button.btn-danger");

    botones.forEach(function (boton) {
      var nombrePizza = boton.closest(".card-body").querySelector(".card-title").textContent.trim();
      boton.addEventListener("click", function () {
        handleAgregarPedido(nombrePizza);
      });
    });
  });