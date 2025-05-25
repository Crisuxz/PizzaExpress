document.getElementById('registroForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const fullname = e.target.fullname.value;
  const email = e.target.email.value.trim().toLowerCase();
  const address = e.target.address.value;
  const password = e.target.password.value;
  const confirmPassword = e.target.confirmPassword.value;

  if (password !== confirmPassword) {
    Swal.fire({
      icon: 'error',
      title: 'Contraseñas no coinciden',
      text: 'Las contraseñas ingresadas no son iguales.'
    });
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
      Swal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        text: 'Redirigiendo al inicio de sesión...',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        window.location.href = 'login.html';
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