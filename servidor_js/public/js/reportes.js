let pedidosGlobal = [];

async function cargarPedidos() {
  const res = await fetch('/api/pedidos/todos');
  const data = await res.json();
  if (!data.success) {
    document.getElementById("tablaPedidosAdmin").innerHTML = "<tr><td colspan='7' class='text-danger'>Error al cargar pedidos.</td></tr>";
    return;
  }
  pedidosGlobal = data.pedidos;
  renderPedidos();
}

function renderPedidos() {
  const busqueda = document.getElementById("busquedaPedidos").value.trim().toLowerCase();
  const estadoFiltro = document.getElementById("filtroEstado").value;
  let pedidos = pedidosGlobal;

  // Filtro por búsqueda
  if (busqueda) {
    pedidos = pedidos.filter(p =>
      String(p.id).includes(busqueda) ||
      (p.cliente && p.cliente.toLowerCase().includes(busqueda)) ||
      (p.direccion && p.direccion.toLowerCase().includes(busqueda))
    );
  }
  // Filtro por estado (soporta plural y singular)
  if (estadoFiltro) {
    pedidos = pedidos.filter(p => {
      const estado = (p.estado || "").toLowerCase();
      if (estadoFiltro === "entregado") return estado === "entregado";
      if (estadoFiltro === "en espera") return estado === "en espera" || estado === "pendiente";
      if (estadoFiltro === "en preparación") return estado === "en preparación";
      if (estadoFiltro === "cancelado") return estado === "cancelado";
      // Para "Entregados" y "Cancelados" (plural)
      if (estadoFiltro === "entregados") return estado === "entregado";
      if (estadoFiltro === "cancelados") return estado === "cancelado";
      return true;
    });
  }

  let html = "";
  pedidos.forEach(pedido => {
    const productos = JSON.parse(pedido.pedido);
    let total = productos.reduce((acc, prod) => acc + parseFloat(prod.precioTotal || prod.precio || 0), 0);
    // Estado badge
    let badge = "";
    if (pedido.estado === "entregado") badge = `<span class="badge bg-success-subtle text-success-emphasis border border-success-subtle">Entregado</span>`;
    else if (pedido.estado === "en preparación") badge = `<span class="badge bg-primary-subtle text-primary-emphasis border border-primary-subtle">En preparación</span>`;
    else if (pedido.estado === "en espera" || pedido.estado === "pendiente") badge = `<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">En espera</span>`;
    else if (pedido.estado === "cancelado") badge = `<span class="badge bg-secondary">Cancelado</span>`;
    else badge = `<span class="badge bg-light text-dark">${pedido.estado}</span>`;

    // Selector de estado
    html += `
      <tr>
        <td>#${pedido.id}</td>
        <td>${pedido.cliente || ""}</td>
        <td>${pedido.direccion}</td>
        <td>${new Date(pedido.fecha).toLocaleString()}</td>
        <td>$${total.toFixed(2)}</td>
        <td>${badge}</td>
        <td>
          <select class="form-select form-select-sm estadoPedidoSelect" data-id="${pedido.id}">
            <option value="en espera" ${pedido.estado === "en espera" || pedido.estado === "pendiente" ? "selected" : ""}>En espera</option>
            <option value="en preparación" ${pedido.estado === "en preparación" ? "selected" : ""}>En preparación</option>
            <option value="entregado" ${pedido.estado === "entregado" ? "selected" : ""}>Entregado</option>
            <option value="cancelado" ${pedido.estado === "cancelado" ? "selected" : ""}>Cancelado</option>
          </select>
        </td>
      </tr>
    `;
  });
  document.getElementById("tablaPedidosAdmin").innerHTML = html;

  // Asigna eventos a los selectores de estado
  document.querySelectorAll(".estadoPedidoSelect").forEach(select => {
    select.addEventListener("change", async function () {
      const pedidoId = this.getAttribute("data-id");
      const nuevoEstado = this.value;
      const res = await fetch(`/api/pedidos/estado/${pedidoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      const data = await res.json();
      if (data.success) {
        mostrarNotificacion("Estado del pedido actualizado");
        // Actualiza el estado en el array global y vuelve a renderizar
        const pedido = pedidosGlobal.find(p => String(p.id) === String(pedidoId));
        if (pedido) pedido.estado = nuevoEstado;
        renderPedidos();
      } else {
        mostrarNotificacion("Error al actualizar estado", true);
      }
    });
  });
}

function mostrarNotificacion(msg, error = false) {
  const toast = document.getElementById("notificacion");
  const texto = document.getElementById("notificacionTexto");
  texto.textContent = msg;
  toast.classList.toggle("text-bg-danger", error);
  toast.classList.toggle("text-bg-light", !error);
  const bsToast = new bootstrap.Toast(toast);
  bsToast.show();
}

document.getElementById("busquedaPedidos").addEventListener("input", renderPedidos);
document.getElementById("filtroEstado").addEventListener("change", renderPedidos);

cargarPedidos();