document.addEventListener("DOMContentLoaded", async function () {
  // Recupera el id del pedido recién hecho (guardado en localStorage al hacer el pedido)
  const pedidoId = localStorage.getItem("ultimoPedidoId");
  const usuarioId = localStorage.getItem("usuarioId");
  if (!pedidoId || !usuarioId) {
    window.location.href = "menu.html";
    return;
  }

  // Busca el pedido en la BD
  const res = await fetch(`/api/pedidos/usuario/${usuarioId}`);
  const data = await res.json();
  if (!data.success || !data.pedidos.length) {
    window.location.href = "menu.html";
    return;
  }
  // Busca el pedido por id
  const pedido = data.pedidos.find(p => String(p.id) === String(pedidoId));
  if (!pedido) {
    window.location.href = "menu.html";
    return;
  }

  // Llena los datos
  document.getElementById("pedidoId").textContent = pedido.id;
  document.getElementById("pedidoFecha").textContent = new Date(pedido.fecha).toLocaleString();

  // Detalles del pedido
  const productos = JSON.parse(pedido.pedido);
  let detallesHtml = "";
  productos.forEach(p => {
    detallesHtml += `
      <div>
        <span class="fw-bold">${p.nombre}</span> (${p.tamanio || "Mediana"})<br>
        Cantidad: ${p.cantidad || 1}
        ${p.extras && p.extras.length > 0 ? `<br>Extras: ${p.extras.join(", ")}` : ""}
        <div class="text-end text-danger fw-bold">${parseFloat(p.precioTotal || p.precio || 0).toLocaleString("en-US", {style:"currency",currency:"USD"})} <span class="text-muted small">c/u</span></div>
      </div>
    `;
  });
  document.getElementById("pedidoDetalles").innerHTML = detallesHtml;

  // Info de entrega
  document.getElementById("entregaNombre").textContent = pedido.nombre;
  document.getElementById("entregaDireccion").textContent = pedido.direccion;
  document.getElementById("entregaPago").textContent = pedido.metodo_pago;
  let totalPedido = productos.reduce((acc, p) => acc + parseFloat(p.precioTotal || p.precio || 0), 0);
  document.getElementById("entregaTotal").textContent = "$" + totalPedido.toFixed(2);

  // Estado
  let estado = pedido.estado === "entregado"
    ? "Entregado"
    : (pedido.estado === "pendiente" ? "En espera" : pedido.estado);
  document.getElementById("pedidoEstado").textContent = estado.charAt(0).toUpperCase() + estado.slice(1);

  // Limpia el id del pedido para que no se repita la confirmación
  localStorage.removeItem("ultimoPedidoId");
});