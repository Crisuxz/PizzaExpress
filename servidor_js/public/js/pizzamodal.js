let pizzaSeleccionada = null;
let precioBase = 0;
let precioTamanio = { "Pequeña": -2, "Mediana": 0, "Grande": 3 }; // Ajusta según tus precios
let tamanioActual = "Mediana";
let cantidadActual = 1;

function actualizarPrecioModal() {
  // Precio base según tamaño
  let base = precioBase + (precioTamanio[tamanioActual] || 0);
  // Suma de extras
  let extras = 0;
  let extrasSeleccionados = [];
  document.querySelectorAll('#adicionalesContainer input[type="checkbox"]:checked').forEach(cb => {
    extras += parseFloat(cb.getAttribute('data-precio')) || 0;
    extrasSeleccionados.push(cb.value);
  });
  // Precio total
  let total = (base + extras) * cantidadActual;
  document.getElementById('pizzaModalPrecio').textContent = "$" + total.toFixed(2);
  return { base, extras, extrasSeleccionados, total };
}

document.addEventListener("DOMContentLoaded", function () {
  // Cuando se abre el modal, llena los datos
  document.querySelectorAll('button.btn-danger[data-bs-toggle="modal"]').forEach(function (boton) {
    boton.addEventListener('click', function () {
      const img = boton.getAttribute('data-pizzaimg');
      const nombre = boton.getAttribute('data-pizzaname');
      const desc = boton.getAttribute('data-pizzadesc');
      const precio = parseFloat(boton.getAttribute('data-precio'));
      const ingredientes = boton.getAttribute('data-pizzaingredientes').split(',').map(i => i.trim());

      pizzaSeleccionada = {
        nombre,
        img,
        desc,
        ingredientes
      };
      precioBase = precio;
      tamanioActual = "Mediana";
      cantidadActual = 1;

      // Reset modal
      document.getElementById('pizzaModalLabel').textContent = nombre;
      document.getElementById('pizzaModalImg').src = img;
      document.getElementById('pizzaModalImg').alt = nombre;
      document.getElementById('pizzaModalDesc').textContent = desc;
      document.getElementById('pizzaModalIngredientes').innerHTML =
        ingredientes.map(i => `<span class="badge bg-light text-dark border me-1">${i}</span>`).join(" ");
      document.getElementById('inputCantidad').value = 1;
      // Tamaño: activa Mediana
      document.getElementById('btnTamanioPequena').classList.remove('btn-danger', 'active');
      document.getElementById('btnTamanioPequena').classList.add('btn-outline-secondary');
      document.getElementById('btnTamanioMediana').classList.add('btn-danger', 'active');
      document.getElementById('btnTamanioMediana').classList.remove('btn-outline-secondary');
      document.getElementById('btnTamanioGrande').classList.remove('btn-danger', 'active');
      document.getElementById('btnTamanioGrande').classList.add('btn-outline-secondary');
      // Extras: desmarca todos
      document.querySelectorAll('#adicionalesContainer input[type="checkbox"]').forEach(cb => cb.checked = false);

      actualizarPrecioModal();
    });
  });

  // Tamaño
  document.getElementById('btnTamanioPequena').onclick = function () {
    tamanioActual = "Pequeña";
    this.classList.add('btn-danger', 'active');
    this.classList.remove('btn-outline-secondary');
    document.getElementById('btnTamanioMediana').classList.remove('btn-danger', 'active');
    document.getElementById('btnTamanioMediana').classList.add('btn-outline-secondary');
    document.getElementById('btnTamanioGrande').classList.remove('btn-danger', 'active');
    document.getElementById('btnTamanioGrande').classList.add('btn-outline-secondary');
    actualizarPrecioModal();
  };
  document.getElementById('btnTamanioMediana').onclick = function () {
    tamanioActual = "Mediana";
    this.classList.add('btn-danger', 'active');
    this.classList.remove('btn-outline-secondary');
    document.getElementById('btnTamanioPequena').classList.remove('btn-danger', 'active');
    document.getElementById('btnTamanioPequena').classList.add('btn-outline-secondary');
    document.getElementById('btnTamanioGrande').classList.remove('btn-danger', 'active');
    document.getElementById('btnTamanioGrande').classList.add('btn-outline-secondary');
    actualizarPrecioModal();
  };
  document.getElementById('btnTamanioGrande').onclick = function () {
    tamanioActual = "Grande";
    this.classList.add('btn-danger', 'active');
    this.classList.remove('btn-outline-secondary');
    document.getElementById('btnTamanioPequena').classList.remove('btn-danger', 'active');
    document.getElementById('btnTamanioPequena').classList.add('btn-outline-secondary');
    document.getElementById('btnTamanioMediana').classList.remove('btn-danger', 'active');
    document.getElementById('btnTamanioMediana').classList.add('btn-outline-secondary');
    actualizarPrecioModal();
  };

  // Cantidad
  document.getElementById('btnMenos').onclick = function () {
    if (cantidadActual > 1) {
      cantidadActual--;
      document.getElementById('inputCantidad').value = cantidadActual;
      actualizarPrecioModal();
    }
  };
  document.getElementById('btnMas').onclick = function () {
    cantidadActual++;
    document.getElementById('inputCantidad').value = cantidadActual;
    actualizarPrecioModal();
  };
  document.getElementById('inputCantidad').oninput = function () {
    let val = parseInt(this.value);
    if (isNaN(val) || val < 1) val = 1;
    cantidadActual = val;
    this.value = cantidadActual;
    actualizarPrecioModal();
  };

  // Ingredientes adicionales
  document.querySelectorAll('#adicionalesContainer input[type="checkbox"]').forEach(cb => {
    cb.onchange = actualizarPrecioModal;
  });

  // Agregar al carrito desde el modal
  const btnAgregar = document.getElementById('btnAgregarCarrito');
  if (btnAgregar) {
    btnAgregar.addEventListener('click', function () {
      if (
        pizzaSeleccionada &&
        pizzaSeleccionada.nombre &&
        !isNaN(precioBase)
      ) {
        const { base, extras, extrasSeleccionados, total } = actualizarPrecioModal();
        let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        carrito.push({
          nombre: pizzaSeleccionada.nombre,
          img: pizzaSeleccionada.img,
          desc: pizzaSeleccionada.desc,
          tamanio: tamanioActual,
          cantidad: cantidadActual,
          precioBase: base,
          extras: extrasSeleccionados,
          precioExtras: extras,
          precioTotal: total,
        });
        localStorage.setItem("carrito", JSON.stringify(carrito));
        var modal = bootstrap.Modal.getInstance(document.getElementById('pizzaModal'));
        modal.hide();
        window.location.href = "carrito.html";
      }
    });
  }
});