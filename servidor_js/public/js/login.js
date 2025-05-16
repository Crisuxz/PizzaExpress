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
      localStorage.setItem("usuarioActual", email); // <-- Agrega esto
      alert('✅ Inicio de sesión exitoso. Redirigiendo...');
      window.location.href = '/'; // Redirige al inicio
    } else {
      alert('❌ Error: ' + data.message);
    }
  } catch (error) {
    console.error('❌ Error en la solicitud:', error);
    alert('❌ Error en el servidor. Inténtalo más tarde.');
  }
});

if (!localStorage.getItem("usuarioActual")) {
  localStorage.setItem("pizzaPendiente", pizza);
  window.location.href = "login.html";
} else {
  // ...
}