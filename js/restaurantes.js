/**
 * Módulo de gestión de restaurantes
 * Conectado directamente con el backend - Sin datos hardcodeados
 */

import { RestaurantesAPI, CategoriasRestaurantesAPI, RankingRestaurantesAPI } from './api.js';
import { animarTarjetas } from './principal.js';

// Estado global
let restaurantesData = [];
let categoriasRestaurantesData = [];
let rankingsRestaurantesData = {};
let filtroActivo = 'todos';

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
 * Carga restaurantes y categorías desde el backend
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

        // Cargar restaurantes y categorías en paralelo
        const [restaurantes, categorias] = await Promise.all([
            RestaurantesAPI.getAll(),
            CategoriasRestaurantesAPI.obtenerTodas()
        ]);

        restaurantesData = restaurantes;
        categoriasRestaurantesData = categorias;
        
        console.log(`📊 ${restaurantesData.length} restaurantes cargados`);
        console.log(`🏷️ ${categoriasRestaurantesData.length} categorías de restaurantes cargadas`);

        // Cargar rankings
        await cargarRankingsRestaurantes();

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

    // Aplicar animación de entrada a las tarjetas recién creadas
    animarTarjetas('#gridRestaurantes');
}

/**
 * Obtiene el nombre de la categoría de restaurante por su ID
 */
function obtenerNombreCategoriaRestaurante(categoriaId) {
    const categoria = categoriasRestaurantesData.find(c => c.id == categoriaId);
    return categoria ? categoria.nombre : 'Categoría no encontrada';
}

/**
 * Carga los rankings de todos los restaurantes
 */
async function cargarRankingsRestaurantes() {
    console.log('⭐ Cargando rankings de restaurantes...');
    
    const promesasRankings = restaurantesData.map(async (restaurante) => {
        try {
            const promedio = await RankingRestaurantesAPI.obtenerPromedio(restaurante.id);
            return { id: restaurante.id, promedio };
        } catch (error) {
            console.warn(`❌ Error cargando ranking del restaurante ${restaurante.id}:`, error);
            return { id: restaurante.id, promedio: 0 };
        }
    });

    const rankings = await Promise.all(promesasRankings);
    
    // Convertir array a objeto para acceso rápido
    rankingsRestaurantesData = {};
    rankings.forEach(ranking => {
        rankingsRestaurantesData[ranking.id] = ranking.promedio;
    });
    
    console.log(`✅ ${rankings.length} rankings de restaurantes cargados:`, rankingsRestaurantesData);
}

/**
 * Obtiene el ranking de un restaurante
 */
function obtenerRankingRestaurante(restauranteId) {
    return rankingsRestaurantesData[restauranteId] || 0;
}

/**
 * Formatea el ranking para mostrar
 */
function formatearRanking(ranking) {
    if (ranking === 0) return 'Sin calificaciones';
    return `⭐ ${ranking.toFixed(1)}`;
}

/**
 * Crea el HTML para una tarjeta de restaurante
 */
function crearTarjetaRestaurante(restaurante) {
    console.log('🏪 Creando tarjeta para restaurante:', restaurante);
    console.log('🏪 ID del restaurante:', restaurante.id, 'tipo:', typeof restaurante.id);
    
    const nombreCategoria = obtenerNombreCategoriaRestaurante(restaurante.categoriaId);

    // Imagen por defecto si no existe
    const imagen = restaurante.imagen_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop&crop=center';

    return `
        <div class="tarjeta-item" data-categoria-id="${restaurante.categoriaId}" data-id="${restaurante.id}">
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
                    <span class="categoria-tag">${nombreCategoria}</span>
                    <span class="direccion">📍 ${restaurante.direccion}</span>
                    <span class="ranking-tag">${formatearRanking(obtenerRankingRestaurante(restaurante.id))}</span>
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

    // Filtrar por categoría usando IDs numéricos
    if (filtroActivo !== 'todos') {
        restaurantesFiltrados = restaurantesFiltrados.filter(restaurante => {
            return restaurante.categoriaId == filtroActivo;
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
    
    const restaurante = restaurantesData.find(r => r.id == id);
    const idNumerico = restaurante ? restaurante.numericId : null;
    
    // Guardar ID numérico en localStorage
    localStorage.setItem('restauranteSeleccionado', idNumerico);
    console.log('✅ ID guardado en localStorage:', localStorage.getItem('restauranteSeleccionado'));
    
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