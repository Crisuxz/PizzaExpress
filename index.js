// index.js
const http = require('http');

const servidor = http.createServer((req, res) => {
  res.end('Servidor NodeJS funcionando');
});

const PORT = 3000;
servidor.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
