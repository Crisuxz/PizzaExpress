document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = e.target.email.value;
  const password = e.target.password.value;

  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.success) {
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