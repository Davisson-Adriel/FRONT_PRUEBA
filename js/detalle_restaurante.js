import { RestaurantesAPI, PlatosAPI, ResenasRestaurantesAPI, ReseñasPlatosAPI, UsuariosAPI, RankingRestaurantesAPI, RankingPlatosAPI } from './api.js';

let restauranteActual = null;
let itemActualParaResena = '';
let tipoItemActualParaResena = '';
let idItemActualParaResena = null;
let rankingRestaurante = 0;
let rankingsPlatos = {};

// Inicializar página
document.addEventListener('DOMContentLoaded', async function() {
    const restauranteId = localStorage.getItem('restauranteSeleccionado');
    
    if (!restauranteId) {
        alert('No se ha seleccionado un restaurante. Volviendo a la página principal.');
        window.location.href = 'principal_usar.html';
        return;
    }

    try {
        restauranteActual = await RestaurantesAPI.getById(restauranteId);
        
        if (!restauranteActual) {
            throw new Error('No se pudo encontrar el restaurante con el ID proporcionado.');
        }

        // Cargar ranking del restaurante
        await cargarRankingRestaurante(restauranteActual.id);
        
        cargarInformacionRestaurante();
        await cargarPlatosRestaurante();
        await cargarResenasRestaurante();
        configurarEventos();
        
    } catch (error) {
        console.error('❌ Error al cargar los detalles del restaurante:', error);
        alert(`Error al cargar el restaurante: ${error.message}`);
        window.location.href = 'principal_usar.html';
    }
});

function configurarEventos() {
    document.getElementById('btnVolver').addEventListener('click', () => {
        window.location.href = 'principal_usar.html';
    });

    document.getElementById('btnCrearResenaRestaurante').addEventListener('click', () => {
        abrirModalCrearResena(restauranteActual.nombre, 'restaurante', restauranteActual.id);
    });

    document.getElementById('cerrarModal').addEventListener('click', cerrarModalResenas);
    document.getElementById('btnCrearResena').addEventListener('click', () => {
        cerrarModalResenas();
        abrirModalCrearResena(itemActualParaResena, tipoItemActualParaResena, idItemActualParaResena);
    });

    document.getElementById('cerrarModalCrear').addEventListener('click', cerrarModalCrearResena);
    document.getElementById('cancelarResena').addEventListener('click', cerrarModalCrearResena);
    document.getElementById('formCrearResena').addEventListener('submit', enviarResena);
}

function cargarInformacionRestaurante() {
    const categorias = { 1: 'Fast Food', 2: 'Gourmet', 3: 'Vegetariano', 4: 'Italiano', 5: 'Parrilla', 6: 'Ensaladas' };
    const categoriaNombre = categorias[restauranteActual.categoriaId] || 'General';
    const imagenUrl = restauranteActual.imagen_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop&crop=center';

    // Header
    document.getElementById('infoRestauranteHeader').innerHTML = `
        <div class="imagen-header-container">
            <img src="${imagenUrl}" 
                 alt="${restauranteActual.nombre}" 
                 class="imagen-header"
                 onerror="this.src='https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop&crop=center'">
        </div>
        <div class="info-header-texto">
            <h1 class="nombre-restaurante">${restauranteActual.nombre}</h1>
            <div class="calificacion-header">
                <span class="categoria-tag">${categoriaNombre}</span>
                <span class="ranking-tag">${formatearRanking(rankingRestaurante)}</span>
            </div>
        </div>
    `;

    // Tarjeta de información completa
    document.getElementById('infoRestauranteCompleta').innerHTML = `
        <div class="info-principal">
            <div class="imagen-principal-container">
                <img src="${imagenUrl}" 
                     alt="${restauranteActual.nombre}" 
                     class="imagen-principal"
                     onerror="this.src='https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=400&fit=crop&crop=center'">
            </div>
            <div class="detalles-restaurante">
                <h2 class="nombre-restaurante-detalle">${restauranteActual.nombre}</h2>
                <p class="descripcion-restaurante">${restauranteActual.descripcion}</p>
                <div class="info-contacto">
                    <div class="item-contacto"><strong>📍 Dirección:</strong> ${restauranteActual.direccion}</div>
                    <div class="item-contacto"><strong>⭐ Calificación:</strong> ${formatearRanking(rankingRestaurante)}</div>
                </div>
            </div>
        </div>
    `;
}

async function cargarPlatosRestaurante() {
    const grid = document.getElementById('gridPlatos');
    try {
        const platosDelRestaurante = await PlatosAPI.getByRestaurante(restauranteActual.id);

        if (platosDelRestaurante.length === 0) {
            grid.innerHTML = '<div class="sin-datos">Este restaurante aún no tiene platos registrados.</div>';
            return;
        }

        // Cargar rankings de los platos
        await cargarRankingsPlatos(platosDelRestaurante);

        grid.innerHTML = platosDelRestaurante.map(plato => {
            const imagenPlato = plato.imagen_url || 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=250&fit=crop&crop=center';
            const rankingPlato = rankingsPlatos[plato.id] || 0;
            return `
                <div class="tarjeta-item">
                    <div class="imagen-container">
                        <img src="${imagenPlato}" 
                             alt="${plato.nombre}" 
                             class="imagen-item"
                             onerror="this.src='https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=250&fit=crop&crop=center'">
                    </div>
                    <div class="info-item">
                        <h3 class="nombre-item">${plato.nombre}</h3>
                        <p class="descripcion-item">${plato.descripcion}</p>
                        <div class="detalles-item">
                            <span class="precio">💰 $${parseFloat(plato.precio).toFixed(2)}</span>
                            <span class="ranking-tag">${formatearRanking(rankingPlato)}</span>
                        </div>
                        <div class="acciones-item">
                            <button class="boton-ver-resenas" onclick="window.abrirModalResenas('${plato.nombre}', 'plato', ${plato.id})">
                                Ver Reseñas
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        grid.innerHTML = '<div class="sin-datos error">❌ Error al cargar los platos.</div>';
        console.error(error);
    }
}

async function cargarResenasRestaurante() {
    const container = document.getElementById('contenedorResenasRestaurante');
    container.innerHTML = '<div class="cargando">🔄 Cargando reseñas...</div>';
    await renderizarResenas(container, 'restaurante', restauranteActual.id);
}

async function renderizarResenas(container, tipo, id) {
    try {
        const [resenas, usuarios] = await Promise.all([
            tipo === 'restaurante' ? ResenasRestaurantesAPI.obtenerPorRestaurante(id) : ReseñasPlatosAPI.obtenerPorPlato(id),
            UsuariosAPI.obtenerTodos()
        ]);

        const usuariosMap = new Map(usuarios.map(u => [u.id, u.username]));

        if (resenas.length === 0) {
            container.innerHTML = '<p class="sin-resenas">Aún no hay reseñas. ¡Sé el primero!</p>';
            return;
        }

        container.innerHTML = resenas.map(resena => {
            const nombreUsuario = usuariosMap.get(resena.usuarioId) || 'Usuario Anónimo';
            const fecha = new Date(resena.fecha).toLocaleDateString('es-ES');
            const estrellas = '★'.repeat(resena.calificacion) + '☆'.repeat(5 - resena.calificacion);
            return `
                <div class="resena-item">
                    <div class="resena-header">
                        <h4 class="nombre-usuario">${nombreUsuario}</h4>
                        <div class="calificacion-estrellas">${estrellas}</div>
                        <span class="fecha-resena">${fecha}</span>
                    </div>
                    <p class="comentario-resena">${resena.comentario}</p>
                    <div class="resena-footer">
                        <span class="likes">👍 ${resena.likes}</span>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        container.innerHTML = '<p class="error-resenas">❌ Error al cargar las reseñas.</p>';
        console.error(error);
    }
}

window.abrirModalResenas = async (nombreItem, tipo, id) => {
    itemActualParaResena = nombreItem;
    tipoItemActualParaResena = tipo;
    idItemActualParaResena = id;

    const modal = document.getElementById('modalResenas');
    document.getElementById('tituloModal').textContent = `Reseñas de ${nombreItem}`;
    const container = document.getElementById('resenasContainer');
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    await renderizarResenas(container, tipo, id);
};

function cerrarModalResenas() {
    const modal = document.getElementById('modalResenas');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function abrirModalCrearResena(nombreItem, tipo, id) {
    itemActualParaResena = nombreItem;
    tipoItemActualParaResena = tipo;
    idItemActualParaResena = id;

    const modal = document.getElementById('modalCrearResena');
    document.getElementById('tituloModalCrear').textContent = `Escribe una reseña para ${nombreItem}`;
    document.getElementById('nombreUsuarioResena').value = localStorage.getItem('nombreUsuario') || '';
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function cerrarModalCrearResena() {
    const modal = document.getElementById('modalCrearResena');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('formCrearResena').reset();
}

async function enviarResena(e) {
    e.preventDefault();
    const botonEnviar = e.target.querySelector('button[type="submit"]');
    const textoOriginalBoton = botonEnviar.innerHTML;

    // Deshabilitar botón y mostrar estado de carga
    botonEnviar.disabled = true;
    botonEnviar.innerHTML = '<span class="spinner"></span> Enviando...';

    const calificacion = document.getElementById('calificacionResena').value;
    const comentario = document.getElementById('comentarioResena').value;

    if (!calificacion || !comentario) {
        alert('Por favor, completa la calificación y el comentario.');
        botonEnviar.disabled = false;
        botonEnviar.innerHTML = textoOriginalBoton;
        return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert('Error de autenticación. Por favor, inicia sesión de nuevo.');
        botonEnviar.disabled = false;
        botonEnviar.innerHTML = textoOriginalBoton;
        return;
    }

    const nuevaResena = {
        usuarioId: 8, 
        calificacion: parseInt(calificacion),
        comentario: comentario,
        fecha: new Date().toISOString(), 
        likes: 0                         
    };

    try {
        if (tipoItemActualParaResena === 'restaurante') {
            nuevaResena.restauranteId = parseInt(idItemActualParaResena);
            await ResenasRestaurantesAPI.crear(nuevaResena); 
            
            // Actualizar ranking del restaurante automáticamente
            await actualizarRankingRestauranteEnInterfaz();
        } else {
            nuevaResena.platoId = idItemActualParaResena;
            await ReseñasPlatosAPI.crear(nuevaResena); 
            
            // Actualizar ranking del plato automáticamente
            await actualizarRankingPlatoEnInterfaz(idItemActualParaResena);
        }
        
        cerrarModalCrearResena();
        alert('¡Gracias por tu reseña!');

        if (tipoItemActualParaResena === 'restaurante') {
            await cargarResenasRestaurante(); 
        }
    } catch (error) {
        alert('Error al enviar la reseña.');
        console.error(error);
    } finally {
        botonEnviar.disabled = false;
        botonEnviar.innerHTML = textoOriginalBoton;
    }
}

// Funciones para manejar rankings
async function cargarRankingRestaurante(restauranteId) {
    try {
        console.log('⭐ Cargando ranking del restaurante...');
        rankingRestaurante = await RankingRestaurantesAPI.obtenerPromedio(restauranteId);
        console.log(`✅ Ranking del restaurante cargado: ${rankingRestaurante}`);
    } catch (error) {
        console.warn('❌ Error cargando ranking del restaurante:', error);
        rankingRestaurante = 0;
    }
}

// Función para actualizar ranking del restaurante en la interfaz
async function actualizarRankingRestauranteEnInterfaz() {
    try {
        console.log('🔄 Actualizando ranking del restaurante en la interfaz...');
        
        // Recargar ranking desde el backend
        await cargarRankingRestaurante(restauranteActual.id);
        
        // Actualizar en el header
        const headerRanking = document.querySelector('.calificacion-header .ranking-tag');
        if (headerRanking) {
            headerRanking.textContent = formatearRanking(rankingRestaurante);
        }
        
        // Actualizar en la información detallada
        const detalleRanking = document.querySelector('.info-contacto .item-contacto:last-child');
        if (detalleRanking) {
            detalleRanking.innerHTML = `<strong>⭐ Calificación:</strong> ${formatearRanking(rankingRestaurante)}`;
        }
        
        console.log('✅ Ranking del restaurante actualizado en la interfaz');
    } catch (error) {
        console.error('❌ Error actualizando ranking del restaurante:', error);
    }
}

// Función para actualizar ranking de un plato específico en la interfaz
async function actualizarRankingPlatoEnInterfaz(platoId) {
    try {
        console.log(`🔄 Actualizando ranking del plato ${platoId} en la interfaz...`);
        
        // Recargar ranking del plato específico
        const nuevoRanking = await RankingPlatosAPI.obtenerPromedio(platoId);
        rankingsPlatos[platoId] = nuevoRanking;
        
        // Buscar la tarjeta del plato en el DOM
        const tarjetaPlato = document.querySelector(`[onclick*="${platoId}"]`)?.closest('.tarjeta-item');
        if (tarjetaPlato) {
            const rankingTag = tarjetaPlato.querySelector('.ranking-tag');
            if (rankingTag) {
                rankingTag.textContent = formatearRanking(nuevoRanking);
            }
        }
        
        console.log(`✅ Ranking del plato ${platoId} actualizado: ${nuevoRanking}`);
    } catch (error) {
        console.error(`❌ Error actualizando ranking del plato ${platoId}:`, error);
    }
}

async function cargarRankingsPlatos(platos) {
    try {
        console.log('⭐ Cargando rankings de platos...');
        const promesasRankings = platos.map(async (plato) => {
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
        rankingsPlatos = {};
        rankings.forEach(ranking => {
            rankingsPlatos[ranking.id] = ranking.promedio;
        });
        
        console.log(`✅ ${rankings.length} rankings de platos cargados:`, rankingsPlatos);
    } catch (error) {
        console.error('❌ Error general cargando rankings de platos:', error);
        rankingsPlatos = {};
    }
}

function formatearRanking(ranking) {
    if (ranking === 0) return 'Sin calificaciones';
    return `⭐ ${ranking.toFixed(1)}`;
}

// Sistema de estrellas para el modal de creación
const estrellas = document.querySelectorAll('.estrella');
estrellas.forEach(estrella => {
    estrella.addEventListener('click', function() {
        const rating = this.dataset.rating;
        document.getElementById('calificacionResena').value = rating;
        estrellas.forEach(s => {
            s.textContent = s.dataset.rating <= rating ? '★' : '☆';
            s.style.color = s.dataset.rating <= rating ? '#ffc107' : '#ddd';
        });
    });
});