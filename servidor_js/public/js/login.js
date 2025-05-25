document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = e.target.email.value.trim().toLowerCase(); // <-- Normaliza el email
  const password = e.target.password.value.trim();

  // Validación básica en el frontend
  if (!email || !password) {
    alert('Por favor, completa todos los campos.');
    return;
  }

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    // Si la respuesta no es JSON válido, mostrar error genérico
    let data;
    try {
      data = await res.json();
    } catch {
      alert('Error inesperado en el servidor.');
      return;
    }

    if (data.success) {
      localStorage.setItem("usuarioActual", email);
      if (data.nombre) localStorage.setItem("nombreUsuario", data.nombre);
      if (data.id) localStorage.setItem("usuarioId", data.id); // <-- Guarda el id
      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: 'Inicio de sesión exitoso. Redirigiendo...',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        window.location.href = '/';
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: data.message
      });
    }
  } catch (error) {
    console.error('❌ Error en la solicitud:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error en el servidor',
      text: 'Inténtalo más tarde.'
    });
  }
});

if (!localStorage.getItem("usuarioActual")) {
  localStorage.setItem("pizzaPendiente", pizza);
  window.location.href = "login.html";
} else {
  // ...
}