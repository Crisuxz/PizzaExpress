// Función para cargar el contenido de un archivo HTML en un elemento
async function loadHTML(elementId, filename) {
    try {
      // Usa fetch para obtener el contenido del archivo
      const response = await fetch(filename);
  
      // Verifica si la respuesta es exitosa (código 200 OK)
      if (!response.ok) {
        throw new Error(`No se pudo cargar el archivo: ${response.statusText}`);
      }
  
      // Obtiene el texto del archivo
      const html = await response.text();
  
      // Encuentra el elemento contenedor por su ID
      const container = document.getElementById(elementId);
  
      // Si el contenedor existe, inserta el HTML dentro de él
      if (container) {
        container.innerHTML = html;
      } else {
        console.error(`Elemento con ID "${elementId}" no encontrado.`);
      }
    } catch (error) {
      console.error('Error al cargar la barra de navegación:', error);
    }
  }
  
  // Espera a que el documento esté completamente cargado antes de ejecutar la función
  document.addEventListener('DOMContentLoaded', () => {
    // Llama a la función para cargar 'navbar.html' en el elemento con ID 'navbar-container'
    loadHTML('navbar-container', 'navbar.html');
  });