// =======================
// Importar módulos necesarios
// =======================
const express = require('express'); // Framework para crear el servidor
const session = require('express-session'); // Manejo de sesiones
const bodyParser = require('body-parser'); // Parseo de datos del cuerpo de las solicitudes
const bcrypt = require('bcrypt'); // Encriptación de contraseñas
const mysql = require('mysql2'); // Conexión a MySQL
const path = require('path'); // Manejo de rutas de archivos
const { isAdmin } = require('./adminUsers'); // <--- Agregado para admins predefinidos
const requireLogin = require('./middleware/auth'); // Agrega esta línea

// =======================
// Inicializar la aplicación
// =======================
const app = express(); // Crear la aplicación de Express
const PORT = 3000; // Puerto donde correrá el servidor

// =======================
// Conexión a MySQL
// =======================
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

// =======================
// Middlewares globales
// =======================

// Parsear datos JSON en las solicitudes
app.use(bodyParser.json());
// Parsear datos codificados en URL (formularios)
app.use(bodyParser.urlencoded({ extended: true }));
// Manejo de sesiones
app.use(session({
  secret: 'secreto_seguro', // Clave secreta para firmar la sesión
  resave: false, // No guardar la sesión si no hay cambios
  saveUninitialized: false // No guardar sesiones vacías
}));

// =======================
// Rutas API REST (modulares)
// =======================
// Aquí se importan las rutas RESTful para usuarios y pizzas
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/pizzas', require('./routes/pizzaRoutes'));

// =======================
// Archivos estáticos
// =======================
// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

// =======================
// Rutas tradicionales (no REST)
// =======================

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

// Ruta protegida para pedidos
app.get('/pedidos.html', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pedidos.html'));
});

// Ruta para iniciar sesión (desde formulario tradicional)
app.post('/login', async (req, res) => {
  const email = req.body.email.trim().toLowerCase(); // <-- Normaliza el email
  const password = req.body.password;

  if (!email || !password) {
    return res.json({ success: false, message: 'Todos los campos son obligatorios.' });
  }

  // Primero, revisa si es un admin predefinido
  if (isAdmin(email, password)) {
    req.session.usuario = { email, isAdmin: true };
    return res.json({ success: true, message: 'Inicio de sesión como administrador.' });
  }

  // Si no es admin, sigue con la lógica normal de usuarios
  try {
    const [rows] = await db.promise().query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.json({ success: false, message: 'Usuario no encontrado.' });
    }

    const user = rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.json({ success: false, message: 'Contraseña incorrecta.' });
    }

    req.session.usuario = { id: user.id, fullname: user.fullname, email: user.email };
    res.json({ success: true, message: 'Inicio de sesión exitoso.' });
  } catch (error) {
    console.error('❌ Error en el servidor:', error);
    res.json({ success: false, message: 'Error en el servidor.' });
  }
});

// Ruta para registrar usuarios (desde formulario tradicional)
app.post('/register', async (req, res) => {
  const fullname = req.body.fullname;
  const email = req.body.email.trim().toLowerCase(); // <-- Normaliza el email
  const address = req.body.address;
  const password = req.body.password;

  if (!fullname || !email || !address || !password) {
    return res.json({ success: false, message: 'Todos los campos son obligatorios.' });
  }

  try {
    const [rows] = await db.promise().query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.json({ success: false, message: 'El correo ya está registrado.' });
    }

    const hash = await bcrypt.hash(password, 10);

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

// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html'); // Redirigir al login después de cerrar sesión
  });
});

// =======================
// Iniciar el servidor
// =======================
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
