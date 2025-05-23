document.addEventListener("DOMContentLoaded", function () {
  // Solo admins pueden ver este reporte
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

  const tipoReporte = document.getElementById("tipoReporte");
  const fecha1 = document.getElementById("fecha1");
  const fecha2 = document.getElementById("fecha2");
  const fecha2Container = document.getElementById("fecha2Container");
  const labelFecha1 = document.getElementById("labelFecha1");
  const reporteResultados = document.getElementById("reporteResultados");

  function actualizarInputs() {
    if (tipoReporte.value === "diario") {
      fecha2Container.style.display = "none";
      labelFecha1.textContent = "Fecha";
    } else if (tipoReporte.value === "mensual") {
      fecha2Container.style.display = "none";
      labelFecha1.textContent = "Mes";
      fecha1.type = "month";
    } else {
      fecha2Container.style.display = "";
      labelFecha1.textContent = "Fecha Inicial";
      fecha1.type = "date";
    }
  }
  tipoReporte.addEventListener("change", actualizarInputs);
  actualizarInputs();

  async function cargarReporte() {
    let url = "/api/pedidos/todos";
    const res = await fetch(url);
    const data = await res.json();
    if (!data.success) return;

    let pedidos = data.pedidos;
    let filtro = () => true;
    let titulo = "";

    if (tipoReporte.value === "diario") {
      const f = fecha1.value;
      filtro = p => p.fecha.startsWith(f);
      titulo = `Reporte Diario: ${f.split("-").reverse().join("/")}`;
    } else if (tipoReporte.value === "mensual") {
      const m = fecha1.value;
      filtro = p => p.fecha.startsWith(m);
      titulo = `Reporte Mensual: ${m.split("-").reverse().join("/")}`;
    } else {
      const f1 = fecha1.value, f2 = fecha2.value;
      filtro = p => p.fecha >= f1 && p.fecha <= f2;
      titulo = `Reporte por Rango: ${f1.split("-").reverse().join("/")} - ${f2.split("-").reverse().join("/")}`;
    }

    let pedidosFiltrados = pedidos.filter(filtro);
    let ventasTotales = 0, pedidosCount = pedidosFiltrados.length, productosMap = {};
    pedidosFiltrados.forEach(p => {
      const productos = JSON.parse(p.pedido);
      productos.forEach(prod => {
        ventasTotales += parseFloat(prod.precioTotal || prod.precio || 0);
        let key = prod.nombre + " (" + (prod.tamanio || "Mediana") + ")";
        if (!productosMap[key]) productosMap[key] = { cantidad: 0, ingresos: 0 };
        productosMap[key].cantidad += prod.cantidad || 1;
        productosMap[key].ingresos += parseFloat(prod.precioTotal || prod.precio || 0);
      });
    });
    let valorPromedio = pedidosCount ? ventasTotales / pedidosCount : 0;

    let html = `
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <div class="fw-bold mb-2">${titulo}</div>
          <div class="row text-center">
            <div class="col-md-4">
              <div class="fw-semibold text-muted">Ventas Totales</div>
              <div class="fs-2">$${ventasTotales.toFixed(2)}</div>
            </div>
            <div class="col-md-4">
              <div class="fw-semibold text-muted">Pedidos</div>
              <div class="fs-2">${pedidosCount}</div>
            </div>
            <div class="col-md-4">
              <div class="fw-semibold text-muted">Valor Promedio</div>
              <div class="fs-2">$${valorPromedio.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <div class="fw-bold mb-2">Ventas por Producto</div>
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad Vendida</th>
                <th>Ingresos</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(productosMap).map(([nombre, v]) =>
                `<tr>
                  <td>${nombre}</td>
                  <td>${v.cantidad}</td>
                  <td>$${v.ingresos.toFixed(2)}</td>
                </tr>`
              ).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
    reporteResultados.innerHTML = html;
  }

  document.getElementById("tipoReporte").addEventListener("change", cargarReporte);
  document.getElementById("fecha1").addEventListener("change", cargarReporte);
  if (fecha2) fecha2.addEventListener("change", cargarReporte);

  // Inicializa con la fecha de hoy
  const hoy = new Date().toISOString().slice(0, 10);
  fecha1.value = hoy;
  if (fecha2) fecha2.value = hoy;
  cargarReporte();
});