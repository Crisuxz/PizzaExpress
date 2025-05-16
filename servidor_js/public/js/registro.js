document.getElementById('registroForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const fullname = e.target.fullname.value;
  const email = e.target.email.value.trim().toLowerCase(); // <-- Normaliza el email
  const address = e.target.address.value;
  const password = e.target.password.value;
  const confirmPassword = e.target.confirmPassword.value;

  if (password !== confirmPassword) {
    alert('❌ Las contraseñas no coinciden.');
    return;
  }

  try {
    const res = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullname, email, address, password })
    });

    const data = await res.json();

    if (data.success) {
      alert('✅ Registro exitoso. Redirigiendo...');
      window.location.href = 'login.html';
    } else {
      alert('❌ Error: ' + data.message);
    }
  } catch (error) {
    console.error('❌ Error en la solicitud:', error);
    alert('❌ Error en el servidor. Inténtalo más tarde.');
  }
});