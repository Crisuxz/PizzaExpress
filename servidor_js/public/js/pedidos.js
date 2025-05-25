 document.addEventListener("DOMContentLoaded", async function () {
  const usuarioId = localStorage.getItem("usuarioId");
  if (!usuarioId) {
    document.getElementById("pedidosContainer").innerHTML = "<p class='text-danger'>Debes iniciar sesión para ver tus pedidos.</p>";
    return;
  }
  const res = await fetch(`/api/pedidos/usuario/${usuarioId}`);
  const data = await res.json();
  if (!data.success || !data.pedidos.length) {
    document.getElementById("pedidosContainer").innerHTML = "<p class='text-muted'>No tienes pedidos aún.</p>";
    return;
  }
  let html = "";
  data.pedidos.forEach((pedido, idx) => {
    const productos = JSON.parse(pedido.pedido);
    let productosHtml = "";
    productos.forEach(p => {
      productosHtml += `
        <div>
          <span class="fw-bold">${p.nombre}</span> (${p.tamanio || "Mediana"}) x${p.cantidad || 1}
          ${p.extras && p.extras.length > 0 ? `<br>Extras: ${p.extras.join(", ")}` : ""}
          <div class="text-end text-muted small">${parseFloat(p.precioTotal || p.precio || 0).toLocaleString("en-US", {style:"currency",currency:"USD"})}</div>
        </div>
      `;
    });
    // Estado visual
    let estadoBadge = "";
    if (pedido.estado === "entregado") {
      estadoBadge = `<span class="badge bg-success-subtle text-success-emphasis border border-success-subtle px-3 py-2 fs-6"><i class="bi bi-check-circle"></i> Entregado</span>`;
    } else if (pedido.estado === "en espera" || pedido.estado === "pendiente") {
      estadoBadge = `<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3 py-2 fs-6"><i class="bi bi-clock"></i> En espera</span>`;
    } else {
      estadoBadge = `<span class="badge bg-secondary px-3 py-2 fs-6">${pedido.estado}</span>`;
    }
    // Total del pedido
    let totalPedido = productos.reduce((acc, p) => acc + parseFloat(p.precioTotal || p.precio || 0), 0);

    html += `
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="fw-bold">Pedido #${pedido.id}</div>
            <div>${estadoBadge}</div>
          </div>
          <div class="mb-2 small text-muted">${new Date(pedido.fecha).toLocaleString()}</div>
          <div class="mb-2"><span class="fw-semibold">Productos:</span><br>${productosHtml}</div>
          <div class="mb-2">
            <span class="fw-semibold">Método de pago:</span> ${pedido.metodo_pago} <br>
            <span class="fw-semibold">Dirección:</span> <span class="fw-bold">${pedido.direccion}</span>
          </div>
          <div class="text-end fw-bold fs-5 text-danger">Total del pedido: $${totalPedido.toFixed(2)}</div>
        </div>
      </div>
    `;
  });
  document.getElementById("pedidosContainer").innerHTML = html;
});