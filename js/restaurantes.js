/**
 * Módulo de gestión de restaurantes
 * Conectado directamente con el backend - Sin datos hardcodeados
 */

import { RestaurantesAPI } from './api.js';

// Estado global
let restaurantesData = [];
let filtroActivo = 'todos';

// Mapeo de categorías del backend a nombres legibles
const CATEGORIAS_MAP = {
    1: { nombre: 'Fast Food', clase: 'fast-food' },
    2: { nombre: 'Gourmet', clase: 'gourmet' },
    3: { nombre: 'Vegetariano', clase: 'vegetariano' },
    4: { nombre: 'Italiano', clase: 'italiano' },
    5: { nombre: 'Parrilla', clase: 'parrilla' },
    6: { nombre: 'Ensaladas', clase: 'ensaladas' }
};

/**
 * Inicializa el sistema de restaurantes
 */
async function inicializarRestaurantes() {
    console.log('🍽️ Inicializando sistema de restaurantes...');

    try {
        await cargarRestaurantes();
        configurarEventos();
        console.log('✅ Sistema de restaurantes inicializado');
    } catch (error) {
        console.error('❌ Error al inicializar restaurantes:', error);
        mostrarError('Error al cargar restaurantes', error.message);
    }
}

/**
 * Carga restaurantes desde el backend
 */
async function cargarRestaurantes() {
    const container = document.getElementById('gridRestaurantes');
    if (!container) {
        console.error('❌ Contenedor de restaurantes no encontrado');
        return;
    }

    try {
        // Mostrar loading
        container.innerHTML = '<div class="loading">🍽️ Cargando restaurantes...</div>';

        // Cargar desde API
        restaurantesData = await RestaurantesAPI.getAll();
        console.log(`📊 ${restaurantesData.length} restaurantes cargados`);

        // Renderizar
        renderizarRestaurantes(restaurantesData);

    } catch (error) {
        console.error('❌ Error al cargar restaurantes:', error);
        mostrarError('No se pudieron cargar los restaurantes', error.message);
    }
}

/**
 * Renderiza la lista de restaurantes
 */
function renderizarRestaurantes(restaurantes) {
    const container = document.getElementById('gridRestaurantes');
    if (!container) return;

    if (!restaurantes || restaurantes.length === 0) {
        container.innerHTML = '<div class="sin-datos">No hay restaurantes disponibles</div>';
        return;
    }

    const restaurantesHTML = restaurantes.map(crearTarjetaRestaurante).join('');
    container.innerHTML = restaurantesHTML;
}

/**
 * Crea el HTML para una tarjeta de restaurante
 */
function crearTarjetaRestaurante(restaurante) {
    console.log('🏪 Creando tarjeta para restaurante:', restaurante);
    console.log('🏪 ID del restaurante:', restaurante.id, 'tipo:', typeof restaurante.id);
    
    const categoria = CATEGORIAS_MAP[restaurante.categoriaId] || { nombre: 'General', clase: 'general' };

    // Imagen por defecto si no existe
    const imagen = restaurante.imagen_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop&crop=center';

    return `
        <div class="tarjeta-item" data-categoria="${categoria.clase}" data-id="${restaurante.id}">
            <div class="imagen-container">
                <img src="${imagen}" 
                     alt="${restaurante.nombre}" 
                     class="imagen-item"
                     onerror="this.src='https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop&crop=center'">
                <div class="overlay-item">
                    <button class="boton-ver-detalle" onclick="verDetalleRestaurante(${restaurante.id})">
                        Ver Restaurante
                    </button>
                </div>
            </div>
            <div class="info-item">
                <h3 class="nombre-item">${restaurante.nombre}</h3>
                <p class="descripcion-item">${restaurante.descripcion}</p>
                <div class="detalles-item">
                    <span class="categoria-tag">${categoria.nombre}</span>
                    <span class="direccion">📍 ${restaurante.direccion}</span>
                </div>
                <div class="acciones-item">
                    <button class="boton-ver-resenas" onclick="verResenasRestaurante(${restaurante.id})">
                        Ver Reseñas
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Configura los eventos del sistema
 */
function configurarEventos() {
    // Filtro de categorías
    const filtroSelect = document.getElementById('filtroRestaurantes');
    if (filtroSelect) {
        filtroSelect.addEventListener('change', function () {
            filtroActivo = this.value;
            aplicarFiltros();
        });
    }
}

/**
 * Aplica los filtros activos
 */
function aplicarFiltros() {
    if (!restaurantesData || restaurantesData.length === 0) return;

    let restaurantesFiltrados = [...restaurantesData];

    // Filtrar por categoría
    if (filtroActivo !== 'todos') {
        restaurantesFiltrados = restaurantesFiltrados.filter(restaurante => {
            const categoria = CATEGORIAS_MAP[restaurante.categoriaId];
            return categoria && categoria.clase === filtroActivo;
        });
    }

    renderizarRestaurantes(restaurantesFiltrados);
}

/**
 * Ver detalles de un restaurante
 */
function verDetalleRestaurante(id) {
    console.log('🍽️ === DEBUG VER DETALLE ===');
    console.log('ID recibido:', id);
    console.log('Tipo de ID:', typeof id);
    console.log('JSON del ID:', JSON.stringify(id));
    
    // Asegurar que sea un número
    const idNumerico = parseInt(id);
    console.log('ID convertido a número:', idNumerico);
    
    if (isNaN(idNumerico)) {
        console.error('❌ ID no es válido:', id);
        alert('Error: ID de restaurante no válido');
        return;
    }
    
    // Guardar ID numérico en localStorage
    localStorage.setItem('restauranteSeleccionado', idNumerico);
    console.log('✅ ID guardado en localStorage:', localStorage.getItem('restauranteSeleccionado'));
    
    // Navegar a la página de detalles
    window.location.href = 'detalle_restaurante.html';
}

/**
 * Ver reseñas de un restaurante
 */
function verResenasRestaurante(id) {
    const restaurante = restaurantesData.find(r => r.id == id);
    if (!restaurante) {
        console.error('❌ Restaurante no encontrado:', id);
        return;
    }

    console.log('⭐ Ver reseñas de:', restaurante);

    // Integrar con el sistema de reseñas del backend
    if (typeof mostrarModalResenas === 'function') {
        mostrarModalResenas(restaurante.nombre, 'restaurante', restaurante.id);
    } else {
        alert(`Reseñas de ${restaurante.nombre}\n\n(Sistema de reseñas en desarrollo)`);
    }
}

/**
 * Muestra un error en el contenedor
 */
function mostrarError(titulo, detalle) {
    const container = document.getElementById('gridRestaurantes');
    if (!container) return;

    container.innerHTML = `
        <div class="error-container">
            <div class="error-icon">❌</div>
            <h3>${titulo}</h3>
            <p>${detalle}</p>
            <div class="error-actions">
                <button onclick="cargarRestaurantes()" class="boton-reintentar">
                    🔄 Reintentar
                </button>
            </div>
        </div>
    `;
}

/**
 * Recargar restaurantes
 */
function recargarRestaurantes() {
    console.log('🔄 Recargando restaurantes...');
    cargarRestaurantes();
}

// Funciones globales para uso desde HTML
window.verDetalleRestaurante = verDetalleRestaurante;
window.verResenasRestaurante = verResenasRestaurante;
window.recargarRestaurantes = recargarRestaurantes;
window.inicializarRestaurantes = inicializarRestaurantes;

// Inicialización automática cuando se carga el script
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarRestaurantes);
    } else {
        // Si el DOM ya está listo, inicializar después de un breve delay
        setTimeout(inicializarRestaurantes, 100);
    }
}