// Hacer la función accesible globalmente
window.agregarAlCarrito = function(pizza) {
  if (!localStorage.getItem("usuarioActual")) {
    localStorage.setItem("pizzaPendiente", pizza);
    window.location.href = "login.html";
  } else {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito.push(pizza);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    Swal.fire({
      icon: 'success',
      title: '¡Agregado!',
      text: 'Pizza agregada al carrito.',
      timer: 1200,
      showConfirmButton: false
    });
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
    window.location.href = "login.html";
  } else {
    agregarAlCarrito(nombrePizza);
    Swal.fire({
      icon: 'success',
      title: '¡Agregado!',
      text: nombrePizza + " fue agregada al carrito.",
      timer: 1200,
      showConfirmButton: false
    }).then(() => {
      window.location.href = "index.html";
    });
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
  var botones = document.querySelectorAll("button.btn-danger[data-bs-toggle='modal']");

  botones.forEach(function (boton) {
    boton.addEventListener("click", function (e) {
      if (!localStorage.getItem("usuarioActual")) {
        e.preventDefault();
        window.location.href = "login.html";
      }
      // Si está logueado, NO hagas preventDefault, deja que Bootstrap abra el modal
    });
  });
});