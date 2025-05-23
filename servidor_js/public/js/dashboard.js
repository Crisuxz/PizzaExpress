document.addEventListener("DOMContentLoaded", async function () {
  // Solo admins pueden ver este dashboard
  const admins = [
    "admin1@pizzeria.com",
    "admin2@pizzeria.com",
    "admin3@pizzeria.com"
  ];
  const usuario = localStorage.getItem("usuarioActual");
  if (!admins.includes(usuario)) {
    window.location.href = "index.html";
    return;
  }

  // Carga pedidos
  const res = await fetch('/api/pedidos/todos');
  const data = await res.json();
  if (!data.success) return;

  // Métricas
  let ventasTotales = 0, pedidosTotales = 0, pendientes = 0, entregados = 0, enPreparacion = 0;
  let recientes = data.pedidos.slice(0, 2);
  let estados = { "en espera": 0, "en preparación": 0, "entregado": 0 };

  data.pedidos.forEach(p => {
    const productos = JSON.parse(p.pedido);
    ventasTotales += productos.reduce((acc, prod) => acc + parseFloat(prod.precioTotal || prod.precio || 0), 0);
    pedidosTotales++;
    // Agrupa "pendiente" y "en espera"
    if (p.estado === "entregado") entregados++;
    else if (p.estado === "en preparación") enPreparacion++;
    else pendientes++;

    // Agrupa "pendiente" y "en espera" en el mismo contador
    if (p.estado === "en espera" || p.estado === "pendiente") {
      estados["en espera"] = (estados["en espera"] || 0) + 1;
    } else if (p.estado === "en preparación") {
      estados["en preparación"] = (estados["en preparación"] || 0) + 1;
    } else if (p.estado === "entregado") {
      estados["entregado"] = (estados["entregado"] || 0) + 1;
    }
  });

  document.getElementById("ventasTotales").textContent = "$" + ventasTotales.toFixed(2);
  document.getElementById("pedidosTotales").textContent = pedidosTotales;
  document.getElementById("pedidosPendientes").textContent = pendientes;
  document.getElementById("pedidosEntregados").textContent = entregados;

  // Pedidos recientes
  let html = "";
  recientes.forEach(p => {
    const productos = JSON.parse(p.pedido);
    let total = productos.reduce((acc, prod) => acc + parseFloat(prod.precioTotal || prod.precio || 0), 0);
    let badge = "";
    if (p.estado === "entregado") badge = `<span class="badge bg-success-subtle text-success-emphasis border border-success-subtle">Entregado</span>`;
    else if (p.estado === "en preparación") badge = `<span class="badge bg-primary-subtle text-primary-emphasis border border-primary-subtle">En preparación</span>`;
    else badge = `<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">En espera</span>`;
    html += `<tr>
      <td>#${p.id}</td>
      <td>${p.cliente}</td>
      <td>${new Date(p.fecha).toLocaleDateString()}</td>
      <td>$${total.toFixed(2)}</td>
      <td>${badge}</td>
    </tr>`;
  });
  document.getElementById("tablaPedidosRecientes").innerHTML = html;

  // Estado de pedidos (barras)
  let estadoHtml = `
    <div class="mb-2">En espera <span class="float-end">${estados["en espera"] || 0}</span>
      <div class="progress"><div class="progress-bar bg-warning" style="width:${(estados["en espera"] || 0) / pedidosTotales * 100 || 0}%"></div></div>
    </div>
    <div class="mb-2">En preparación <span class="float-end">${estados["en preparación"] || 0}</span>
      <div class="progress"><div class="progress-bar bg-primary" style="width:${(estados["en preparación"] || 0) / pedidosTotales * 100 || 0}%"></div></div>
    </div>
    <div class="mb-2">Entregados <span class="float-end">${estados["entregado"] || 0}</span>
      <div class="progress"><div class="progress-bar bg-success" style="width:${(estados["entregado"] || 0) / pedidosTotales * 100 || 0}%"></div></div>
    </div>
  `;
  document.getElementById("estadoPedidos").innerHTML = estadoHtml;
});