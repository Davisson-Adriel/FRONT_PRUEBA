import { UsuariosAPI, ResenasRestaurantesAPI, ReseñasPlatosAPI } from './api.js';

document.addEventListener('DOMContentLoaded', function () {
    const nombreUsuario = localStorage.getItem('nombreUsuario') || 'Usuario';
    document.getElementById('nombreUsuario').textContent = nombreUsuario;

    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', function() {
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                localStorage.clear();
                window.location.href = '../index.html';
            }
        });
    }
});

// Navegación entre secciones
const botonesNavegacion = document.querySelectorAll('.boton-navegacion');
const seccionesContenido = document.querySelectorAll('.seccion-contenido');

botonesNavegacion.forEach(boton => {
    boton.addEventListener('click', function () {
        botonesNavegacion.forEach(b => b.classList.remove('activo'));
        this.classList.add('activo');

        const seccion = this.getAttribute('data-seccion');

        seccionesContenido.forEach(s => {
            s.style.display = 'none';
            s.classList.remove('activa');
        });


        const seccionMostrar = document.getElementById(`seccion${seccion.charAt(0).toUpperCase() + seccion.slice(1)}`);
        seccionMostrar.style.display = 'block';
        seccionMostrar.classList.add('activa');
    });
});

// Filtros
function aplicarFiltro(filtro, grid) {
    const tarjetas = grid.querySelectorAll('.tarjeta-item');

    tarjetas.forEach(tarjeta => {
        const categoria = tarjeta.getAttribute('data-categoria');

        if (filtro === 'todos' || categoria === filtro) {
            tarjeta.style.display = 'block';
            tarjeta.style.animation = 'fadeIn 0.3s ease';
        } else {
            tarjeta.style.display = 'none';
        }
    });
}

// Filtro de restaurantes
document.getElementById('filtroRestaurantes').addEventListener('change', function () {
    const filtro = this.value;
    const grid = document.getElementById('gridRestaurantes');
    aplicarFiltro(filtro, grid);
});

// Filtro de platos
document.getElementById('filtroPlatos').addEventListener('change', function () {
    const filtro = this.value;
    const grid = document.getElementById('gridPlatos');
    aplicarFiltro(filtro, grid);
});

// Variables globales para el sistema de reseñas
let itemActual = '';
let tipoItemActual = ''; 
let idItemActual = null;
let idResenaEditando = null; 
let cacheUsuarios = {};

// Función para cargar usuarios en cache
async function cargarUsuariosEnCache() {
    if (Object.keys(cacheUsuarios).length === 0) {
        try {
            const usuarios = await UsuariosAPI.obtenerTodos();
            usuarios.forEach(usuario => {
                cacheUsuarios[usuario.id] = usuario.username;
            });
            console.log('✅ Usuarios cargados en cache:', cacheUsuarios);
        } catch (error) {
            console.error('❌ Error cargando usuarios:', error);
        }
    }
}

// Función para obtener nombre de usuario desde cache
function obtenerNombreUsuario(usuarioId) {
    return cacheUsuarios[usuarioId] || `Usuario ${usuarioId}`;
}

// Funcionalidad de botones
document.addEventListener('click', async function (e) {
    console.log('Clic detectado en:', e.target.className);

    if (e.target.classList.contains('boton-ver-detalle')) {
        const tarjeta = e.target.closest('.tarjeta-item');
        const seccionActiva = document.querySelector('.seccion-contenido.activa');

        if (seccionActiva && seccionActiva.id === 'seccionRestaurantes') {
            const restauranteId = tarjeta.getAttribute('data-id'); 
            console.log('Navegando a detalles de restaurante por ID:', restauranteId);
            localStorage.setItem('restauranteSeleccionado', restauranteId);
            window.location.href = 'detalle_restaurante.html';
        } else if (seccionActiva && seccionActiva.id === 'seccionPlatos') {
            console.log('Clic en plato - delegando a verDetallePlato()');
            return;
        }
    }

    if (e.target.classList.contains('boton-ver-menu')) {
        const nombreItem = e.target.closest('.tarjeta-item').querySelector('.nombre-item').textContent;
        alert(`Visualizando: ${nombreItem}`);
    }

    if (e.target.classList.contains('boton-ver-resenas')) {
        const tarjeta = e.target.closest('.tarjeta-item');
        const nombreItem = tarjeta.querySelector('.nombre-item').textContent;
        const idItem = tarjeta.getAttribute('data-id');
        mostrarModalResenas(nombreItem, null, idItem);
    }

    // Clic en imagen de restaurante - solo para la sección de restaurantes
    if (e.target.classList.contains('imagen-item')) {
        console.log('Clic en imagen detectado');
        const tarjeta = e.target.closest('.tarjeta-item');
        const seccionActiva = document.querySelector('.seccion-contenido.activa');

        console.log('Sección activa:', seccionActiva ? seccionActiva.id : 'No encontrada');

        if (seccionActiva && seccionActiva.id === 'seccionRestaurantes') {
            const restauranteId = tarjeta.getAttribute('data-id');
            const nombreRestaurante = tarjeta.querySelector('.nombre-item').textContent;
            console.log('Restaurante seleccionado por ID:', restauranteId);
            localStorage.setItem('restauranteSeleccionado', restauranteId); 
            alert(`Navegando a detalles de: ${nombreRestaurante}`);
            window.location.href = 'detalle_restaurante.html';
        } else {
            console.log('No está en la sección de restaurantes o sección no encontrada');
        }
    }

    if (e.target.classList.contains('boton-editar-resena')) {
        const resenaItem = e.target.closest('.resena-item');
        idResenaEditando = e.target.getAttribute('data-id');

        const comentario = resenaItem.querySelector('.comentario-resena').textContent;
        const estrellasContainer = resenaItem.querySelector('.calificacion-estrellas');
        const calificacion = (estrellasContainer.textContent.match(/★/g) || []).length;

        document.getElementById('modalResenas').style.display = 'none';
        document.getElementById('modalCrearResena').style.display = 'flex';

        document.getElementById('nombreUsuarioResena').value = localStorage.getItem('nombreUsuario') || '';
        document.getElementById('comentarioResena').value = comentario;
        document.getElementById('calificacionResena').value = calificacion;
        calificacionSeleccionada = calificacion;
        actualizarEstrellas();
    }

    // Clic en el nuevo botón "Eliminar Reseña"
    if (e.target.classList.contains('boton-eliminar-resena')) {
        const resenaItem = e.target.closest('.resena-item');
        const idResenaAEliminar = e.target.getAttribute('data-id');

        if (confirm('¿Estás seguro de que deseas eliminar esta reseña? Esta acción no se puede deshacer.')) {
            try {
                if (tipoItemActual === 'restaurante') {
                    await ResenasRestaurantesAPI.eliminar(idResenaAEliminar);
                } else {
                    await ReseñasPlatosAPI.eliminar(idResenaAEliminar);
                }
                
                resenaItem.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                resenaItem.style.opacity = '0';
                resenaItem.style.transform = 'translateX(-20px)';
                setTimeout(() => resenaItem.remove(), 300);

            } catch (error) {
                console.error('Error al eliminar la reseña:', error);
                alert('❌ No se pudo eliminar la reseña. Inténtalo de nuevo.');
            }
        }
    }

    if (e.target.classList.contains('likes-resena-accion') || e.target.parentElement.classList.contains('likes-resena-accion')) {
        const likeButton = e.target.closest('.likes-resena-accion');
        const resenaId = likeButton.getAttribute('data-id');
        const userId = parseInt(localStorage.getItem('userId'));

        if (!userId) {
            alert('Debes iniciar sesión para dar like.');
            return;
        }

        try {
            const api = tipoItemActual === 'restaurante' ? ResenasRestaurantesAPI : ReseñasPlatosAPI;
            const response = await api.toggleLike(resenaId, userId);

            likeButton.querySelector('.like-count').textContent = response.likes;
            likeButton.classList.toggle('liked', response.likedByUser);

        } catch (error) {
            console.error('Error al dar like:', error);
            alert(`${error.message}`);
        }
    }
});

async function mostrarModalResenas(nombreItem, tipo = null, id = null) {
    if (!tipo) {
        const seccionActiva = document.querySelector('.seccion-contenido.activa');
        tipo = seccionActiva?.id === 'seccionRestaurantes' ? 'restaurante' : 'plato';
    }

    if (!id) {
        const tarjetas = document.querySelectorAll('.tarjeta-item');
        for (let tarjeta of tarjetas) {
            const nombre = tarjeta.querySelector('.nombre-item')?.textContent;
            if (nombre === nombreItem) {
                id = tarjeta.getAttribute('data-id');
                break;
            }
        }
    }

    itemActual = nombreItem;
    tipoItemActual = tipo;
    idItemActual = id;

    const modal = document.getElementById('modalResenas');
    const titulo = document.getElementById('tituloModal');
    const container = document.getElementById('resenasContainer');

    titulo.textContent = `Reseñas de ${nombreItem}`;
    container.innerHTML = '<div class="loading">🔄 Cargando reseñas...</div>';

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    try {
        await cargarUsuariosEnCache();

        let resenas = [];

        if (tipo === 'restaurante') {
            resenas = await ResenasRestaurantesAPI.obtenerPorRestaurante(id);
        } else if (tipo === 'plato') {
            resenas = await ReseñasPlatosAPI.obtenerPorPlato(id);
        }

        container.innerHTML = '';

        if (resenas.length === 0) {
            container.innerHTML = '<p class="sin-resenas">Aún no hay reseñas para este item. ¡Sé el primero en crear una!</p>';
        } else {
            resenas.forEach(resena => {
                const resenaElement = crearElementoResenaBackend(resena);
                container.appendChild(resenaElement);
            });
        }

    } catch (error) {
        console.error('Error al cargar reseñas:', error);
        container.innerHTML = '<p class="error-resenas">❌ Error al cargar las reseñas. Intenta de nuevo.</p>';
    }
}

// Función para crear elemento de reseña del backend con nombre de usuario
function crearElementoResenaBackend(resena) {
    const div = document.createElement('div');
    div.className = 'resena-item';

    const estrellas = '★'.repeat(resena.calificacion) + '☆'.repeat(5 - resena.calificacion);
    
    const fecha = new Date(resena.fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',    
        day: 'numeric'
    });

    // Obtener el nombre del usuario desde cache
    const nombreUsuario = obtenerNombreUsuario(resena.usuarioId);

    // Comprobar si la reseña pertenece al usuario actual
    const userIdActual = localStorage.getItem('userId');
    const esMiResena = userIdActual && parseInt(userIdActual) === resena.usuarioId;

    const likedByUser = resena.likedBy && resena.likedBy.includes(parseInt(userIdActual));

    div.innerHTML = `
        <div class="resena-header">
            <h4 class="nombre-usuario">${nombreUsuario}</h4>
            <div class="calificacion-estrellas">${estrellas}</div>
            <span class="fecha-resena">${fecha}</span>
            <button 
                class="likes-resena-accion ${likedByUser ? 'liked' : ''} ${esMiResena ? 'disabled' : ''}" 
                data-id="${resena.id}"
                ${esMiResena ? 'disabled' : ''}
            >
                👍 <span class="like-count">${resena.likes}</span>
            </button>
            ${esMiResena ? `
                <div class="acciones-resena">
                    <button class="boton-editar-resena" data-id="${resena.id}">Editar</button>
                    <button class="boton-eliminar-resena" data-id="${resena.id}">Eliminar</button>
                </div>
            ` : ''}
        </div>
        <p class="comentario-resena">${resena.comentario}</p>
    `;

    return div;
}

// Cerrar modal de reseñas
document.getElementById('cerrarModal').addEventListener('click', function () {
    document.getElementById('modalResenas').style.display = 'none';
    document.body.style.overflow = 'auto';
});

// Abrir modal de crear reseña
document.getElementById('btnCrearResena').addEventListener('click', function () {
    document.getElementById('modalResenas').style.display = 'none';
    document.getElementById('modalCrearResena').style.display = 'flex';

    // Llenar el nombre del usuario si está disponible
    const nombreUsuario = localStorage.getItem('nombreUsuario') || '';
    document.getElementById('nombreUsuarioResena').value = nombreUsuario;
});

// Cerrar modal de crear reseña
document.getElementById('cerrarModalCrear').addEventListener('click', function () {
    cerrarModalCrearResena();
});

document.getElementById('cancelarResena').addEventListener('click', function () {
    cerrarModalCrearResena();
});

function cerrarModalCrearResena() {
    document.getElementById('modalCrearResena').style.display = 'none';
    document.body.style.overflow = 'auto';
    idResenaEditando = null; 
    limpiarFormularioResena();
}

// Sistema de estrellas
const estrellas = document.querySelectorAll('.estrella');
let calificacionSeleccionada = 0;

estrellas.forEach(estrella => {
    estrella.addEventListener('click', function () {
        calificacionSeleccionada = parseInt(this.getAttribute('data-rating'));
        document.getElementById('calificacionResena').value = calificacionSeleccionada;
        actualizarEstrellas();
    });

    estrella.addEventListener('mouseover', function () {
        const rating = parseInt(this.getAttribute('data-rating'));
        destacarEstrellas(rating);
    });
});

document.querySelector('.estrellas-container').addEventListener('mouseleave', function () {
    actualizarEstrellas();
});

function destacarEstrellas(rating) {
    estrellas.forEach((estrella, index) => {
        if (index < rating) {
            estrella.textContent = '★';
            estrella.style.color = '#ffc107';
        } else {
            estrella.textContent = '☆';
            estrella.style.color = '#ddd';
        }
    });
}

function actualizarEstrellas() {
    destacarEstrellas(calificacionSeleccionada);
}

// Enviar reseña al backend
document.getElementById('formCrearResena').addEventListener('submit', async function (e) {
    e.preventDefault();

    const nombre = document.getElementById('nombreUsuarioResena').value.trim();
    const calificacion = parseInt(document.getElementById('calificacionResena').value);
    const comentario = document.getElementById('comentarioResena').value.trim();

    if (!nombre || !calificacion || !comentario) {
        alert('Por favor, completa todos los campos');
        return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
         alert('Error de autenticación. Por favor, inicia sesión de nuevo para crear una reseña.');
        return;
    }

    try {
        const nuevaResena = {
            usuarioId: parseInt(userId), // CORRECCIÓN: Usar el ID del usuario logueado
            calificacion: calificacion,
            comentario: comentario,
            fecha: new Date().toISOString(),
            likes: 0                        
        };

        if (idResenaEditando) {
            // se implementa la edición de una reseña existente
            const datosActualizados = {
                calificacion: calificacion,
                comentario: comentario
            };
            if (tipoItemActual === 'restaurante') {
                await ResenasRestaurantesAPI.actualizar(idResenaEditando, datosActualizados);
            } else {
                await ReseñasPlatosAPI.actualizar(idResenaEditando, datosActualizados);
            }
            alert('¡Reseña actualizada exitosamente!');
        } else {

            // se implementa la creación de una nueva reseña
            if (tipoItemActual === 'restaurante') {
                nuevaResena.restauranteId = parseInt(idItemActual); 
                await ResenasRestaurantesAPI.crear(nuevaResena);
            } else if (tipoItemActual === 'plato') {
                nuevaResena.platoId = parseInt(idItemActual);
                await ReseñasPlatosAPI.crear(nuevaResena);
            }
            alert('¡Reseña creada exitosamente!');
        }

        cerrarModalCrearResena();

        // Volver a mostrar el modal de reseñas actualizado
        setTimeout(() => {
            mostrarModalResenas(itemActual, tipoItemActual, idItemActual);
        }, 500);

    } catch (error) {
        console.error('Error al crear reseña:', error);
        alert('❌ Error al crear la reseña. Intenta de nuevo.');
    }
});

function limpiarFormularioResena() {
    document.getElementById('formCrearResena').reset();
    calificacionSeleccionada = 0;
    actualizarEstrellas();
}

// Cerrar modales al hacer clic fuera
window.addEventListener('click', function (e) {
    const modalResenas = document.getElementById('modalResenas');
    const modalCrear = document.getElementById('modalCrearResena');

    if (e.target === modalResenas) {
        modalResenas.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    if (e.target === modalCrear) {
        cerrarModalCrearResena();
    }
});

/**
 * Aplica una animación de entrada a las tarjetas de una sección.
 * @param {string} gridSelector - El selector CSS del grid que contiene las tarjetas.
 */
export function animarTarjetas(gridSelector) {
    const grid = document.querySelector(gridSelector);
    if (!grid) return;
    const tarjetas = grid.querySelectorAll('.tarjeta-item');
    tarjetas.forEach((tarjeta, index) => {
        setTimeout(() => {
            tarjeta.style.opacity = '1';
            tarjeta.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Carga inicial de datos de usuario
window.addEventListener('load', cargarUsuariosEnCache);