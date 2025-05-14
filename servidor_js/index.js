// Importar módulos necesarios
const express = require('express'); // Framework para crear el servidor
const session = require('express-session'); // Manejo de sesiones
const bodyParser = require('body-parser'); // Parseo de datos del cuerpo de las solicitudes
const bcrypt = require('bcrypt'); // Encriptación de contraseñas
const mysql = require('mysql2'); // Conexión a MySQL
const path = require('path'); // Manejo de rutas de archivos

const app = express(); // Crear la aplicación de Express
const PORT = 3000; // Puerto donde correrá el servidor

// Conexión a MySQL
const db = mysql.createConnection({
  host: 'localhost', // Dirección del servidor MySQL
  user: 'root', // Usuario de MySQL
  password: '123456', // Contraseña de MySQL (cámbiala si es diferente)
  database: 'autenticacion', // Nombre de la base de datos
  port: 3306 // Puerto de MySQL
});

// Conectar a la base de datos
db.connect(err => {
  if (err) {
    console.error('❌ Error al conectar a MySQL:', err);
    process.exit(1); // Detener el servidor si no se puede conectar
  }
  console.log('✅ Conectado a MySQL');
});

// Middleware
app.use(bodyParser.json()); // Parsear datos JSON en las solicitudes
app.use(bodyParser.urlencoded({ extended: true })); // Parsear datos codificados en URL
app.use(session({
  secret: 'secreto_seguro', // Clave secreta para firmar la sesión
  resave: false, // No guardar la sesión si no hay cambios
  saveUninitialized: false // No guardar sesiones vacías
}));
app.use(express.static(path.join(__dirname, 'public'))); // Servir archivos estáticos desde la carpeta "public"

// Ruta protegida para la página principal
app.get('/', (req, res) => {
  if (req.session.usuario) {
    // Si el usuario está autenticado, mostrar la página principal
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    // Si no está autenticado, redirigir al login
    res.redirect('/login.html');
  }
});

// Ruta para registrar usuarios
app.post('/register', async (req, res) => {
  const { fullname, email, address, password } = req.body;

  // Validar campos vacíos
  if (!fullname || !email || !address || !password) {
    return res.json({ success: false, message: 'Todos los campos son obligatorios.' });
  }

  try {
    // Verificar si el correo ya está registrado
    const [rows] = await db.promise().query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.json({ success: false, message: 'El correo ya está registrado.' });
    }

    // Encriptar la contraseña
    const hash = await bcrypt.hash(password, 10);

    // Insertar el nuevo usuario en la base de datos
    await db.promise().query(
      'INSERT INTO usuarios (fullname, email, address, password) VALUES (?, ?, ?, ?)',
      [fullname, email, address, hash]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error en el servidor:', error);
    res.json({ success: false, message: 'Error en el servidor.' });
  }
});

// Ruta para iniciar sesión
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validar campos vacíos
  if (!email || !password) {
    return res.json({ success: false, message: 'Todos los campos son obligatorios.' });
  }

  try {
    // Buscar al usuario por correo
    const [rows] = await db.promise().query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.json({ success: false, message: 'Usuario no encontrado.' });
    }

    const user = rows[0];

    // Comparar la contraseña ingresada con la almacenada
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.json({ success: false, message: 'Contraseña incorrecta.' });
    }

    // Guardar información del usuario en la sesión
    req.session.usuario = { id: user.id, fullname: user.fullname, email: user.email };
    res.json({ success: true, message: 'Inicio de sesión exitoso.' });
    window.location.href = 'index.html'; // Redirigir al index después de iniciar sesión
  } catch (error) {
    console.error('❌ Error en el servidor:', error);
    res.json({ success: false, message: 'Error en el servidor.' });
  }
});

// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html'); // Redirigir al login después de cerrar sesión
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
