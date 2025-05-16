// Lista de administradores predefinidos
const adminUsers = [
  { email: 'admin1@pizzeria.com', password: 'admin123' },
  { email: 'admin2@pizzeria.com', password: 'admin456' },
  { email: 'admin3@pizzeria.com', password: 'admin789' }
];

// Función para validar si un usuario es admin
function isAdmin(email, password) {
  return adminUsers.some(
    user => user.email === email && user.password === password
  );
}

module.exports = { isAdmin };