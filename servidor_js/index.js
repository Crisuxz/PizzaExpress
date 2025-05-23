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
const fs = require('fs');

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

// Importa y usa las rutas de pedidos, pasando la conexión db
const pedidoRoutes = require('./routes/pedidosRoutes')(db);
app.use('/api/pedidos', pedidoRoutes);

// =======================
// Archivos estáticos
// =======================
// Servir archivos estáticos desde la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));

// =======================
// Rutas tradicionales (no REST)
// =======================

// Rutas para todas las páginas HTML en /public
const publicDir = path.join(__dirname, 'public');

// Elimina la extensión .html de las rutas
fs.readdirSync(publicDir).forEach(file => {
  if (file.endsWith('.html')) {
    const route = '/' + file.replace('.html', '');
    app.get(route, (req, res) => {
      res.sendFile(path.join(publicDir, file));
    });
  }
});

// Redirección raíz a /index
app.get('/', (req, res) => {
  res.redirect('/index');
});

// Ruta protegida para pedidos
app.get('/pedidos', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pedidos.html'));
});

// Ruta para iniciar sesión (desde formulario tradicional)
app.post('/login', async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const password = req.body.password;

  if (!email || !password) {
    // 400: Bad Request
    return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
  }

  // Primero, revisa si es un admin predefinido
  if (isAdmin(email, password)) {
    req.session.usuario = { email, isAdmin: true };
    // 200: OK
    return res.status(200).json({ success: true, message: 'Inicio de sesión como administrador.', nombre: email });
  }

  try {
    const [rows] = await db.promise().query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length === 0) {
      // 404: Not Found
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    const user = rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      // 401: Unauthorized
      return res.status(401).json({ success: false, message: 'Contraseña incorrecta.' });
    }

    req.session.usuario = { id: user.id, fullname: user.fullname, email: user.email };
    // 200: OK
    res.status(200).json({ success: true, message: 'Inicio de sesión exitoso.', nombre: user.fullname, id: user.id });
  } catch (error) {
    console.error('❌ Error en el servidor:', error);
    // 500: Internal Server Error
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
});

// Ruta para registrar usuarios (desde formulario tradicional)
app.post('/register', async (req, res) => {
  const fullname = req.body.fullname;
  const email = req.body.email.trim().toLowerCase();
  const address = req.body.address;
  const password = req.body.password;

  if (!fullname || !email || !address || !password) {
    // 400: Bad Request
    return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios.' });
  }

  try {
    const [rows] = await db.promise().query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length > 0) {
      // 409: Conflict
      return res.status(409).json({ success: false, message: 'El correo ya está registrado.' });
    }

    const hash = await bcrypt.hash(password, 10);

    await db.promise().query(
      'INSERT INTO usuarios (fullname, email, address, password) VALUES (?, ?, ?, ?)',
      [fullname, email, address, hash]
    );

    // 201: Created
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('❌ Error en el servidor:', error);
    // 500: Internal Server Error
    res.status(500).json({ success: false, message: 'Error en el servidor.' });
  }
});

// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login.html'); // Redirigir al login después de cerrar sesión
  });
});

// Middleware para manejar rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).send(`
    <html>
      <head>
        <title>Página no encontrada</title>
        <style>
          body { font-family: Arial; background: #fff3f3; color: #b71c1c; text-align: center; padding: 50px; }
          h1 { font-size: 3em; }
        </style>
      </head>
      <body>
        <h1>404</h1>
        <p>La página que buscas no existe.</p>
        <button onclick="window.location.href='/index'">Ir al inicio</button>
      </body>
    </html>
  `);
});

// Middleware para errores generales (500)
app.use((err, req, res, next) => {
  console.error('❌ Error en el servidor:', err);
  res.status(500).send(`
    <html>
      <head>
        <title>Error del servidor</title>
        <style>
          body { font-family: Arial; background: #fff3f3; color: #b71c1c; text-align: center; padding: 50px; }
          h1 { font-size: 3em; }
        </style>
      </head>
      <body>
        <h1>500</h1>
        <p>Ocurrió un error interno en el servidor.</p>
        <button onclick="window.location.href='/index'">Ir al inicio</button>
      </body>
    </html>
  `);
});

// =======================
// Iniciar el servidor
// =======================
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
