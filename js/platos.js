/**
 * Módulo de gestión de platos
 * Conectado directamente con el backend - Sin datos hardcodeados
 */

import { PlatosAPI } from './api.js';

// Estado global
let platosData = [];
let filtroActivoPlatos = 'todos';

// Mapeo de categorías del backend a nombres legibles
const CATEGORIAS_PLATOS_MAP = {
    1: { nombre: 'Fast Food', clase: 'fast-food' },
    2: { nombre: 'Gourmet', clase: 'gourmet' },
    3: { nombre: 'Postres', clase: 'postres' },
    4: { nombre: 'Italiano', clase: 'italiano' },
    5: { nombre: 'Parrilla', clase: 'parrilla' },
    6: { nombre: 'Ensaladas', clase: 'ensaladas' }
};

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
 * Carga platos desde el backend
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

        // Cargar desde API
        platosData = await PlatosAPI.getAll();
        console.log(`📊 ${platosData.length} platos cargados`);

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
}

/**
 * Crea el HTML para una tarjeta de plato
 */
function crearTarjetaPlato(plato) {
    const categoria = CATEGORIAS_PLATOS_MAP[plato.categoriaId] || { nombre: 'General', clase: 'general' };
    
    // Imagen por defecto si no existe
    const imagen = plato.imagen_url || 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=250&fit=crop&crop=center';
    
    // Formatear precio
    const precio = parseFloat(plato.precio || 0).toFixed(2);
    
    return `
        <div class="tarjeta-item" data-categoria="${categoria.clase}" data-id="${plato.id}">
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
                    <span class="categoria-tag">${categoria.nombre}</span>
                    <span class="precio">💰 $${precio}</span>
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

    // Filtrar por categoría
    if (filtroActivoPlatos !== 'todos') {
        platosFiltrados = platosFiltrados.filter(plato => {
            const categoria = CATEGORIAS_PLATOS_MAP[plato.categoriaId];
            return categoria && categoria.clase === filtroActivoPlatos;
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
    
    // Asegurar que sea un número
    const restauranteId = parseInt(plato.id_restaurante);
    console.log('ID del restaurante convertido a número:', restauranteId);
    
    if (isNaN(restauranteId)) {
        console.error('❌ ID del restaurante no es válido:', plato.id_restaurante);
        return;
    }
    
    // Guardar ID del restaurante en localStorage (mismo sistema que verDetalleRestaurante)
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
        alert(`Reseñas de ${plato.nombre}\n\n(Sistema de reseñas en desarrollo)`);
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