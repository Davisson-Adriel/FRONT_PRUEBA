/**
 * Módulo de gestión de platos
 * Conectado directamente con el backend - Sin datos hardcodeados
 */

import { PlatosAPI, CategoriasPlatosAPI, RestaurantesAPI, RankingPlatosAPI } from './api.js';
import { animarTarjetas } from './principal.js';

// Estado global
let platosData = [];
let restaurantesData = [];
let categoriasPlatosData = [];
let rankingsPlatosData = {};
let filtroActivoPlatos = 'todos';

/**
 * Inicializa el sistema de platos
 */
async function inicializarPlatos() {
    console.log('🍕 Inicializando sistema de platos...');
    
    try {
        await cargarPlatos();
        configurarEventosPlatos();
        console.log('✅ Sistema de platos inicializado');
    } catch (error) {
        console.error('❌ Error al inicializar platos:', error);
        mostrarErrorPlatos('Error al cargar platos', error.message);
    }
}

/**
 * Carga platos, restaurantes y categorías desde el backend
 */
async function cargarPlatos() {
    const container = document.getElementById('gridPlatos');
    if (!container) {
        console.error('❌ Contenedor de platos no encontrado');
        return;
    }

    try {
        // Mostrar loading
        container.innerHTML = '<div class="loading">🍕 Cargando platos...</div>';

        // Cargar platos, restaurantes y categorías en paralelo
        const [platos, restaurantes, categorias] = await Promise.all([
            PlatosAPI.getAll(),
            RestaurantesAPI.getAll(),
            CategoriasPlatosAPI.obtenerTodas()
        ]);

        platosData = platos;
        restaurantesData = restaurantes;
        categoriasPlatosData = categorias;
        
        console.log(`📊 ${platosData.length} platos cargados`);
        console.log(`🍽️ ${restaurantesData.length} restaurantes cargados`);
        console.log(`🏷️ ${categoriasPlatosData.length} categorías de platos cargadas`);

        // Cargar rankings después de tener los datos de platos
        await cargarRankingsPlatos();

        // Renderizar
        renderizarPlatos(platosData);

    } catch (error) {
        console.error('❌ Error al cargar platos:', error);
        mostrarErrorPlatos('No se pudieron cargar los platos', error.message);
    }
}

/**
 * Renderiza la lista de platos
 */
function renderizarPlatos(platos) {
    const container = document.getElementById('gridPlatos');
    if (!container) return;

    if (!platos || platos.length === 0) {
        container.innerHTML = '<div class="sin-datos">No hay platos disponibles</div>';
        return;
    }

    const platosHTML = platos.map(crearTarjetaPlato).join('');
    container.innerHTML = platosHTML;
    animarTarjetas('#gridPlatos');
}

/**
 * Obtiene el nombre del restaurante por su ID
 */
function obtenerNombreRestaurante(restauranteId) {
    const restaurante = restaurantesData.find(r => r.id == restauranteId);
    return restaurante ? restaurante.nombre : 'Restaurante no encontrado';
}

/**
 * Obtiene el nombre de la categoría de plato por su ID
 */
function obtenerNombreCategoriaPlato(categoriaId) {
    const categoria = categoriasPlatosData.find(c => c.id == categoriaId);
    return categoria ? categoria.nombre : 'Categoría no encontrada';
}

/**
 * Carga los rankings de todos los platos
 */
async function cargarRankingsPlatos() {
    console.log('⭐ Cargando rankings de platos...');
    
    const promesasRankings = platosData.map(async (plato) => {
        try {
            const promedio = await RankingPlatosAPI.obtenerPromedio(plato.id);
            return { id: plato.id, promedio };
        } catch (error) {
            console.warn(`❌ Error cargando ranking del plato ${plato.id}:`, error);
            return { id: plato.id, promedio: 0 };
        }
    });

    const rankings = await Promise.all(promesasRankings);
    
    // Convertir array a objeto para acceso rápido
    rankingsPlatosData = {};
    rankings.forEach(ranking => {
        rankingsPlatosData[ranking.id] = ranking.promedio;
    });
    
    console.log(`✅ ${rankings.length} rankings de platos cargados:`, rankingsPlatosData);
}

/**
 * Obtiene el ranking de un plato
 */
function obtenerRankingPlato(platoId) {
    return rankingsPlatosData[platoId] || 0;
}

/**
 * Formatea el ranking para mostrar
 */
function formatearRankingPlato(ranking) {
    if (ranking === 0) return 'Sin calificaciones';
    return `⭐ ${ranking.toFixed(1)}`;
}

/**
 * Crea el HTML para una tarjeta de plato
 */
function crearTarjetaPlato(plato) {
    // Imagen por defecto si no existe
    const imagen = plato.imagen_url || 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=250&fit=crop&crop=center';
    
    // Formatear precio
    const precio = parseFloat(plato.precio || 0).toFixed(2);
    
    // Obtener nombres dinámicamente desde el backend
    const nombreCategoria = obtenerNombreCategoriaPlato(plato.categoriaId);
    const nombreRestaurante = obtenerNombreRestaurante(plato.id_restaurante);
    
    return `
        <div class="tarjeta-item" data-categoria-id="${plato.categoriaId}" data-id="${plato.id}">
            <div class="imagen-container">
                <img src="${imagen}" 
                     alt="${plato.nombre}" 
                     class="imagen-item"
                     onerror="this.src='https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=250&fit=crop&crop=center'">
                <div class="overlay-item">
                    <button class="boton-ver-detalle" onclick="verDetallePlato(${plato.id})">
                        Conocer Restaurante
                    </button>
                </div>
            </div>
            <div class="info-item">
                <h3 class="nombre-item">${plato.nombre}</h3>
                <p class="descripcion-item">${plato.descripcion}</p>
                <div class="detalles-item">
                    <span class="categoria-tag">${nombreCategoria}</span>
                    <span class="precio">💰 $${precio}</span>
                    <span class="restaurante-tag">🍽️ ${nombreRestaurante}</span>
                    <span class="ranking-tag">${formatearRankingPlato(obtenerRankingPlato(plato.id))}</span>
                </div>
                <div class="acciones-item">
                    <button class="boton-ver-resenas" onclick="verResenasPlato(${plato.id})">
                        Ver Reseñas
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Configura los eventos del sistema de platos
 */
function configurarEventosPlatos() {
    // Filtro de categorías de platos
    const filtroSelect = document.getElementById('filtroPlatos');
    if (filtroSelect) {
        filtroSelect.addEventListener('change', function() {
            filtroActivoPlatos = this.value;
            aplicarFiltrosPlatos();
        });
    }
}

/**
 * Aplica los filtros activos para platos
 */
function aplicarFiltrosPlatos() {
    if (!platosData || platosData.length === 0) return;

    let platosFiltrados = [...platosData];

    // Filtrar por categoría usando IDs numéricos
    if (filtroActivoPlatos !== 'todos') {
        platosFiltrados = platosFiltrados.filter(plato => {
            return plato.categoriaId == filtroActivoPlatos;
        });
    }

    renderizarPlatos(platosFiltrados);
}

/**
 * Ver detalles de un plato - Redirige a los detalles del restaurante al que pertenece
 */
function verDetallePlato(id) {
    console.log('🍕 === DEBUG VER DETALLE PLATO ===');
    console.log('ID del plato recibido:', id);
    console.log('Tipo de ID:', typeof id);
    
    const plato = platosData.find(p => p.id == id);
    if (!plato) {
        console.error('❌ Plato no encontrado:', id);
        return;
    }

    console.log('🔍 Plato encontrado:', plato);
    console.log('🍽️ ID del restaurante:', plato.id_restaurante);
    
    // Verificar que el plato tenga un restaurante asociado
    if (!plato.id_restaurante) {
        console.error('❌ El plato no tiene restaurante asociado:', plato);
        return;
    }
    
    // CORRECCIÓN: Guardar el ID del restaurante como string, sin convertirlo a número.
    const restauranteId = plato.id_restaurante;
    localStorage.setItem('restauranteSeleccionado', restauranteId);
    console.log('✅ ID del restaurante guardado en localStorage:', localStorage.getItem('restauranteSeleccionado'));
    
    // Navegar a la página de detalles del restaurante
    window.location.href = 'detalle_restaurante.html';
}

/**
 * Ver reseñas de un plato
 */
function verResenasPlato(id) {
    const plato = platosData.find(p => p.id == id);
    if (!plato) {
        console.error('❌ Plato no encontrado:', id);
        return;
    }

    console.log('⭐ Ver reseñas de:', plato);
    
    if (typeof mostrarModalResenas === 'function') {
        mostrarModalResenas(plato.nombre, 'plato', plato.id);
    } else {
        console.log('Sistema de reseñas no disponible en esta página');
    }
}

/**
 * Muestra un error en el contenedor de platos
 */
function mostrarErrorPlatos(titulo, detalle) {
    const container = document.getElementById('gridPlatos');
    if (!container) return;

    container.innerHTML = `
        <div class="error-container">
            <div class="error-icon">❌</div>
            <h3>${titulo}</h3>
            <p>${detalle}</p>
            <div class="error-actions">
                <button onclick="cargarPlatos()" class="boton-reintentar">
                    🔄 Reintentar
                </button>
            </div>
        </div>
    `;
}

/**
 * Recargar platos
 */
function recargarPlatos() {
    console.log('🔄 Recargando platos...');
    cargarPlatos();
}

// Funciones globales para uso desde HTML
window.verDetallePlato = verDetallePlato;
window.verResenasPlato = verResenasPlato;
window.recargarPlatos = recargarPlatos;
window.inicializarPlatos = inicializarPlatos;

// Inicialización automática cuando se carga el script
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarPlatos);
    } else {
        setTimeout(inicializarPlatos, 100);
    }
}