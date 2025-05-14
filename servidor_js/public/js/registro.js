// Código JavaScript para el registro de usuarios
  (function () {
    const form = document.getElementById('registroForm');
    const alerta = document.getElementById('alerta');

    // Lista de correos autorizados para ser administradores
    const correosAdmin = [
      "admin1@pizzeria.com",
      "admin2@pizzeria.com",
      "supervisor@pizzeria.com"
    ];

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      alerta.classList.add('d-none');

      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }

      const nombre = document.getElementById('nombre').value.trim();
      const correo = document.getElementById('correo').value.trim().toLowerCase();
      const direccion = document.getElementById('direccion').value.trim();
      const contrasena = document.getElementById('contrasena').value;
      const confirmar = document.getElementById('confirmar').value;

      if (contrasena !== confirmar) {
        mostrarAlerta('Las contraseñas no coinciden.');
        return;
      }

      const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regexCorreo.test(correo)) {
        mostrarAlerta('El correo electrónico no es válido.');
        return;
      }

      let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

      const yaExiste = usuarios.some(u => u.correo === correo);
      if (yaExiste) {
        mostrarAlerta('Este correo ya está registrado. Inicia sesión o usa otro.');
        return;
      }

      // Verifica si el correo pertenece a un administrador
      let rol = 'cliente';
      if (correo.endsWith('@pizzeria.com')) {
        if (!correosAdmin.includes(correo)) {
          mostrarAlerta('Este correo de administrador no está autorizado.');
          return;
        }
        rol = 'admin';
      }

      const nuevoUsuario = {
        nombre,
        correo,
        direccion,
        contrasena,
        rol
      };

      usuarios.push(nuevoUsuario);
      usuarios.sort((a, b) => a.nombre.localeCompare(b.nombre));
      localStorage.setItem('usuarios', JSON.stringify(usuarios, null, 2));
      localStorage.setItem('usuarioActivo', JSON.stringify(nuevoUsuario, null, 2));

      const ir = confirm('¡Registro exitoso! ¿Quieres ir a la página principal ahora?');
      if (ir) {
        window.location.href = 'index.html';
      } else {
        alert('Puedes iniciar sesión manualmente cuando lo desees.');
      }
    });

    function mostrarAlerta(mensaje) {
      alerta.textContent = mensaje;
      alerta.classList.remove('d-none');
    }
  })();

