function renderCarrito() {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  // Filtra productos inválidos (sin nombre o precio)
  carrito = carrito.filter(pizza =>
    pizza &&
    typeof pizza.nombre === "string" &&
    pizza.nombre.trim() !== "" &&
    !isNaN(parseFloat(pizza.precioTotal || pizza.precio || 0)) &&
    parseFloat(pizza.precioTotal || pizza.precio || 0) > 0
  );
  localStorage.setItem("carrito", JSON.stringify(carrito)); // Limpia el storage si había basura

  const resumen = document.getElementById("pedidoResumen");
  if (carrito.length === 0) {
    resumen.innerHTML = "<p class='text-muted'>Tu carrito está vacío.</p>";
    document.getElementById("subtotal").textContent = "$0.00";
    document.getElementById("total").textContent = "$0.00";
    return;
  }
  let subtotal = 0;
  let html = "";
  carrito.forEach((pizza, idx) => {
    const precioUnitario = parseFloat(pizza.precioTotal || pizza.precio || 0);
    const cantidad = pizza.cantidad || 1;
    subtotal += precioUnitario;
    html += `
      <div class="d-flex justify-content-between align-items-center border-bottom py-2">
        <div>
          <div class="fw-bold">${pizza.nombre}</div>
          <div class="small text-muted">Tamaño: ${pizza.tamanio || "Mediana"}</div>
          ${pizza.extras && pizza.extras.length > 0 ? `<div class="small">Extras: ${pizza.extras.join(", ")}</div>` : ""}
        </div>
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-outline-secondary btn-sm" onclick="cambiarCantidad(${idx}, -1)">-</button>
          <span class="mx-1">${cantidad}</span>
          <button class="btn btn-outline-secondary btn-sm" onclick="cambiarCantidad(${idx}, 1)">+</button>
        </div>
        <div class="text-end">
          <div class="fw-bold">$${precioUnitario.toFixed(2)}</div>
          <div class="small text-muted">$${(precioUnitario / cantidad).toFixed(2)} c/u</div>
        </div>
        <button class="btn btn-link text-danger fs-4" onclick="eliminarPizza(${idx})" title="Eliminar">&#128465;</button>
      </div>
    `;
  });
  resumen.innerHTML = html;
  document.getElementById("subtotal").textContent = "$" + subtotal.toFixed(2);
  document.getElementById("total").textContent = "$" + subtotal.toFixed(2);
}

function cambiarCantidad(idx, delta) {
  let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  let pizza = carrito[idx];
  pizza.cantidad = (pizza.cantidad || 1) + delta;
  if (pizza.cantidad < 1) pizza.cantidad = 1;
  // Recalcula el precio total
  pizza.precioTotal = (pizza.precioBase * pizza.cantidad + (pizza.precioExtras || 0) * pizza.cantidad).toFixed(2);
  carrito[idx] = pizza;
  localStorage.setItem("carrito", JSON.stringify(carrito));
  renderCarrito();
}

function eliminarPizza(idx) {
  Swal.fire({
    title: '¿Eliminar pizza?',
    text: "Esta acción no se puede deshacer.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
      carrito.splice(idx, 1);
      localStorage.setItem("carrito", JSON.stringify(carrito));
      renderCarrito();
      Swal.fire({
        icon: 'success',
        title: 'Eliminado',
        timer: 1000,
        showConfirmButton: false
      });
    }
  });
}

document.getElementById("btnVaciarCarrito").addEventListener("click", function () {
  Swal.fire({
    title: '¿Vaciar carrito?',
    text: "¿Estás seguro de eliminar todos los productos?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, vaciar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("carrito");
      renderCarrito();
      Swal.fire({
        icon: 'success',
        title: 'Carrito vaciado',
        timer: 1000,
        showConfirmButton: false
      });
    }
  });
});

// Método de pago
document.getElementById("btnPagoEfectivo").onclick = function () {
  setMetodoPago("Efectivo");
};
document.getElementById("btnPagoTarjeta").onclick = function () {
  setMetodoPago("Tarjeta");
};
document.getElementById("btnPagoTransferencia").onclick = function () {
  setMetodoPago("Transferencia");
};
function setMetodoPago(metodo) {
  document.getElementById("btnPagoEfectivo").classList.toggle("btn-danger", metodo === "Efectivo");
  document.getElementById("btnPagoEfectivo").classList.toggle("btn-outline-danger", metodo !== "Efectivo");
  document.getElementById("btnPagoTarjeta").classList.toggle("btn-danger", metodo === "Tarjeta");
  document.getElementById("btnPagoTarjeta").classList.toggle("btn-outline-danger", metodo !== "Tarjeta");
  document.getElementById("btnPagoTransferencia").classList.toggle("btn-danger", metodo === "Transferencia");
  document.getElementById("btnPagoTransferencia").classList.toggle("btn-outline-danger", metodo !== "Transferencia");
  document.getElementById("inputMetodoPago").value = metodo;
}

// Realizar pedido: ENVÍA AL BACKEND
document.getElementById("btnRealizarPedido").onclick = async function () {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const usuario_id = localStorage.getItem("usuarioId");
  const nombre = document.getElementById("inputNombre").value.trim();
  const direccion = document.getElementById("inputDireccion").value.trim();
  const metodoPago = document.getElementById("inputMetodoPago").value;

  if (!carrito.length || !usuario_id || !nombre || !direccion || !metodoPago) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos incompletos',
      text: 'Completa todos los campos y agrega al menos una pizza.'
    });
    return;
  }

  try {
    const res = await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario_id, pedido: carrito, nombre, direccion, metodoPago })
    });
    const data = await res.json();
    if (data.success) {
      if (data.pedidoId) {
        localStorage.setItem("ultimoPedidoId", data.pedidoId);
      }
      localStorage.removeItem("carrito");
      Swal.fire({
        icon: 'success',
        title: '¡Pedido realizado!',
        text: 'Tu pedido ha sido registrado correctamente.',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        window.location.href = "pedido_confirmado.html";
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: data.message
      });
    }
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Error al conectar con el servidor.'
    });
  }
};

window.cambiarCantidad = cambiarCantidad;
window.eliminarPizza = eliminarPizza;

renderCarrito();