import { AuthAPI, RestaurantesAPI, PlatosAPI, ResenasRestaurantesAPI, ReseñasPlatosAPI, CategoriasRestaurantesAPI, CategoriasPlatosAPI } from './api.js';

// Obtener nombre de administrador y cargar estadísticas
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 DOM Content Loaded - Inicializando admin panel');
    
    const nombreAdmin = localStorage.getItem('nombreUsuario') || 'Administrador';
    document.getElementById('nombreAdmin').textContent = nombreAdmin;

    // Asignar evento de clic para cerrar sesión
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', cerrarSesion);
    }

    // Configurar event listeners para botones de acción rápida
    setupEventListeners();

    // Cargar estadísticas del backend
    await cargarEstadisticasDelBackend();
});

// Configurar event listeners
function setupEventListeners() {
    console.log('📋 Configurando event listeners');
    
    // Verificar que existen los botones
    const botonesAccion = document.querySelectorAll('.boton-accion-rapida');
    console.log('Botones de acción encontrados:', botonesAccion.length);
    
    botonesAccion.forEach((boton, index) => {
        const accion = boton.getAttribute('data-accion');
        console.log(`Botón ${index + 1}: ${accion}`);
    });
    
    // Manejar clics en las tarjetas de gestión
    document.addEventListener('click', function(e) {
        console.log('Click detectado en:', e.target);
        
        // Clic en acciones rápidas
        if (e.target.closest('.boton-accion-rapida')) {
            const boton = e.target.closest('.boton-accion-rapida');
            const accion = boton.getAttribute('data-accion');
            console.log('Botón de acción rápida clickeado:', accion);
            ejecutarAccionRapida(accion);
        }

        // Clics en botones de restaurantes
        if (e.target.closest('.btn-eliminar-restaurante')) {
            const boton = e.target.closest('.btn-eliminar-restaurante');
            const id = boton.getAttribute('data-id');
            console.log('Eliminar restaurante ID:', id);
            // eliminarRestaurante(id); // Implementar después
        }

        if (e.target.closest('.btn-editar-restaurante')) {
            const boton = e.target.closest('.btn-editar-restaurante');
            const id = boton.getAttribute('data-id');
            console.log('Editar restaurante ID:', id);
            // editarRestaurante(id); // Implementar después
        }

        // Clics en botones de platos
        if (e.target.closest('.btn-eliminar-plato')) {
            const boton = e.target.closest('.btn-eliminar-plato');
            const id = boton.getAttribute('data-id');
            console.log('Eliminar plato ID:', id);
            // eliminarPlato(id); // Implementar después
        }

        if (e.target.closest('.btn-editar-plato')) {
            const boton = e.target.closest('.btn-editar-plato');
            const id = boton.getAttribute('data-id');
            console.log('Editar plato ID:', id);
            // editarPlato(id); // Implementar después
        }

        // Clics en botones de categorías de restaurantes
        if (e.target.closest('.btn-eliminar-categoria-restaurante')) {
            const boton = e.target.closest('.btn-eliminar-categoria-restaurante');
            const id = boton.getAttribute('data-id');
            console.log('Eliminar categoría de restaurante ID:', id);
            // eliminarCategoriaRestaurante(id); // Implementar después
        }

        if (e.target.closest('.btn-editar-categoria-restaurante')) {
            const boton = e.target.closest('.btn-editar-categoria-restaurante');
            const id = boton.getAttribute('data-id');
            console.log('Editar categoría de restaurante ID:', id);
            // editarCategoriaRestaurante(id); // Implementar después
        }

        // Clics en botones de categorías de platos
        if (e.target.closest('.btn-eliminar-categoria-plato')) {
            const boton = e.target.closest('.btn-eliminar-categoria-plato');
            const id = boton.getAttribute('data-id');
            console.log('Eliminar categoría de plato ID:', id);
            // eliminarCategoriaPlato(id); // Implementar después
        }

        if (e.target.closest('.btn-editar-categoria-plato')) {
            const boton = e.target.closest('.btn-editar-categoria-plato');
            const id = boton.getAttribute('data-id');
            console.log('Editar categoría de plato ID:', id);
            // editarCategoriaPlato(id); // Implementar después
        }
    });

    // Event listener para cerrar modal de restaurantes
    const btnCerrarModal = document.getElementById('btnCerrarModalRestaurantes');
    if (btnCerrarModal) {
        btnCerrarModal.addEventListener('click', function() {
            console.log('🔒 Cerrando modal de restaurantes');
            cerrarModalListaRestaurantes();
        });
    }

    // Event listener para cerrar modal al hacer clic fuera del contenido
    const modalListaRestaurantes = document.getElementById('modalListaRestaurantes');
    if (modalListaRestaurantes) {
        modalListaRestaurantes.addEventListener('click', function(e) {
            if (e.target === modalListaRestaurantes) {
                console.log('🔒 Cerrando modal al hacer clic fuera');
                cerrarModalListaRestaurantes();
            }
        });
    }

    // Event listeners para modal de platos
    const btnCerrarModalPlatos = document.getElementById('btnCerrarModalPlatos');
    if (btnCerrarModalPlatos) {
        btnCerrarModalPlatos.addEventListener('click', function() {
            console.log('🔒 Cerrando modal de platos');
            cerrarModalListaPlatos();
        });
    }

    const modalListaPlatos = document.getElementById('modalListaPlatos');
    if (modalListaPlatos) {
        modalListaPlatos.addEventListener('click', function(e) {
            if (e.target === modalListaPlatos) {
                cerrarModalListaPlatos();
            }
        });
    }

    // Event listeners para modal de categorías de restaurantes
    const btnCerrarModalCategoriasRestaurantes = document.getElementById('btnCerrarModalCategoriasRestaurantes');
    if (btnCerrarModalCategoriasRestaurantes) {
        btnCerrarModalCategoriasRestaurantes.addEventListener('click', function() {
            console.log('🔒 Cerrando modal de categorías de restaurantes');
            cerrarModalListaCategoriasRestaurantes();
        });
    }

    const modalListaCategoriasRestaurantes = document.getElementById('modalListaCategoriasRestaurantes');
    if (modalListaCategoriasRestaurantes) {
        modalListaCategoriasRestaurantes.addEventListener('click', function(e) {
            if (e.target === modalListaCategoriasRestaurantes) {
                cerrarModalListaCategoriasRestaurantes();
            }
        });
    }

    // Event listeners para modal de categorías de platos
    const btnCerrarModalCategoriasPlatoss = document.getElementById('btnCerrarModalCategoriasPlatoss');
    if (btnCerrarModalCategoriasPlatoss) {
        btnCerrarModalCategoriasPlatoss.addEventListener('click', function() {
            console.log('🔒 Cerrando modal de categorías de platos');
            cerrarModalListaCategoriasPlatoss();
        });
    }

    const modalListaCategoriasPlatoss = document.getElementById('modalListaCategoriasPlatoss');
    if (modalListaCategoriasPlatoss) {
        modalListaCategoriasPlatoss.addEventListener('click', function(e) {
            if (e.target === modalListaCategoriasPlatoss) {
                cerrarModalListaCategoriasPlatoss();
            }
        });
    }
}

// Función para cargar estadísticas reales del backend
async function cargarEstadisticasDelBackend() {
    try {
        console.log('📊 Cargando estadísticas del backend...');
        
        // Mostrar indicadores de carga
        document.getElementById('totalRestaurantes').innerHTML = '<span class="loading-dot">•••</span>';
        document.getElementById('totalPlatos').innerHTML = '<span class="loading-dot">•••</span>';
        document.getElementById('totalResenas').innerHTML = '<span class="loading-dot">•••</span>';

        // Obtener datos en paralelo para mejor rendimiento
        const [restaurantes, platos, resenasRestaurantes, resenasPlatos] = await Promise.all([
            RestaurantesAPI.getAll().catch(err => {
                console.warn('Error cargando restaurantes:', err);
                return [];
            }),
            PlatosAPI.getAll().catch(err => {
                console.warn('Error cargando platos:', err);
                return [];
            }),
            ResenasRestaurantesAPI.obtenerTodas().catch(err => {
                console.warn('Error cargando reseñas de restaurantes:', err);
                return [];
            }),
            ReseñasPlatosAPI.obtenerTodas().catch(err => {
                console.warn('Error cargando reseñas de platos:', err);
                return [];
            })
        ]);

        // Calcular totales
        const totalRestaurantes = restaurantes.length;
        const totalPlatos = platos.length;
        const totalResenas = resenasRestaurantes.length + resenasPlatos.length;

        console.log('✅ Estadísticas cargadas:', {
            restaurantes: totalRestaurantes,
            platos: totalPlatos,
            resenas: totalResenas
        });

        // Mostrar los números directamente sin animación
        document.getElementById('totalRestaurantes').textContent = totalRestaurantes;
        document.getElementById('totalPlatos').textContent = totalPlatos;
        document.getElementById('totalResenas').textContent = totalResenas;
        
        // Guardar timestamp de última actualización
        localStorage.setItem('ultimaActualizacionEstadisticas', new Date().toISOString());

    } catch (error) {
        console.error('❌ Error cargando estadísticas:', error);
        
        // Mostrar valores por defecto en caso de error
        document.getElementById('totalRestaurantes').textContent = '--';
        document.getElementById('totalPlatos').textContent = '--';
        document.getElementById('totalResenas').textContent = '--';
        
        // Mostrar notificación de error
        mostrarNotificacion('Error al cargar estadísticas del servidor', 'error');
    }
}

// Función para navegar a módulos de gestión
function navegarAModulo(modulo) {
    console.log(`Navegando a gestión de ${modulo}`);
    
    switch(modulo) {
        case 'restaurantes':
            window.location.href = 'gestionar_restaurantes.html';
            break;
        case 'platos':
            alert(`Navegando a Gestión de Platos\n\nFuncionalidades:\n• Crear nuevos platos\n• Gestionar precios y descripciones\n• Asignar platos a restaurantes\n• Categorizar menús`);
            break;
        case 'categorias-restaurantes':
            alert(`Navegando a Gestión de Categorías de Restaurantes\n\nFuncionalidades:\n• Crear nuevas categorías\n• Editar categorías existentes\n• Eliminar categorías no utilizadas\n• Organizar clasificación`);
            break;
        case 'categorias-platos':
            alert(`Navegando a Gestión de Categorías de Platos\n\nFuncionalidades:\n• Crear nuevas categorías\n• Editar categorías existentes\n• Eliminar categorías no utilizadas\n• Organizar clasificación de menús`);
            break;
    }
}

// Funciones para modales de restaurantes
function mostrarModalAgregarRestaurante() {
    document.getElementById('modalAgregarRestaurante').style.display = 'block';
}

function cerrarModalAgregarRestaurante() {
    document.getElementById('modalAgregarRestaurante').style.display = 'none';
    document.getElementById('formAgregarRestaurante').reset();
}

function guardarRestaurante() {
    const form = document.getElementById('formAgregarRestaurante');
    const formData = new FormData(form);
    
    const restaurante = {
        id: Date.now(),
        nombre: formData.get('nombre'),
        categoria: formData.get('categoria'),
        descripcion: formData.get('descripcion'),
        direccion: formData.get('direccion'),
        telefono: formData.get('telefono'),
        horarios: formData.get('horarios'),
        imagen: formData.get('imagen'),
        especialidades: formData.get('especialidades').split(',').map(e => e.trim())
    };

    // Guardar en localStorage
    let restaurantes = JSON.parse(localStorage.getItem('restaurantes')) || [];
    restaurantes.push(restaurante);
    localStorage.setItem('restaurantes', JSON.stringify(restaurantes));

    alert('Restaurante agregado exitosamente!');
    cerrarModalAgregarRestaurante();
    actualizarEstadisticas();
}

function cargarListaRestaurantes() {
    const restaurantes = JSON.parse(localStorage.getItem('restaurantes')) || [];

    const listaContainer = document.getElementById('listaRestaurantesSimple');
    listaContainer.innerHTML = '';

    if (restaurantes.length === 0) {
        listaContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #666;">
                <div style="font-size: 48px; margin-bottom: 15px;">🍽️</div>
                <div>No hay restaurantes registrados</div>
                <div style="font-size: 12px; margin-top: 5px;">Agrega tu primer restaurante para comenzar</div>
            </div>
        `;
        return;
    }

    restaurantes.forEach(restaurante => {
        const item = document.createElement('div');
        item.className = 'item-restaurante-simple';
        item.innerHTML = `
            <div class="nombre-restaurante">${restaurante.nombre}</div>
            <button onclick="eliminarRestaurante(${restaurante.id})" class="boton-eliminar-simple">
                🗑️ Eliminar
            </button>
        `;
        listaContainer.appendChild(item);
    });
}

function eliminarRestaurante(id) {
    // Esta función se deja como ejemplo, pero para que funcione correctamente
    // debería ser exportada y asignada a window, o el evento debería manejarse de otra forma.
    // Por simplicidad del ejemplo, se mantiene así.
    const restaurantes = JSON.parse(localStorage.getItem('restaurantes')) || [];
    const restaurante = restaurantes.find(r => r.id === id);
    const nombreRestaurante = restaurante ? restaurante.nombre : 'este restaurante';

    if (confirm(`¿Estás seguro de que deseas eliminar "${nombreRestaurante}"?\n\nEsta acción no se puede deshacer.`)) {
        let restaurantesActualizados = restaurantes.filter(r => r.id !== id);
        localStorage.setItem('restaurantes', JSON.stringify(restaurantesActualizados));
        
        cargarListaRestaurantes();
        actualizarEstadisticas();
        
        mostrarNotificacion(`"${nombreRestaurante}" ha sido eliminado exitosamente`, 'success');
    }
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    // Remover notificaciones existentes
    const notificacionesExistentes = document.querySelectorAll('.notificacion');
    notificacionesExistentes.forEach(n => n.remove());
    
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion ${tipo}`;
    notificacion.textContent = mensaje;
    
    // Agregar botón de cerrar
    const botonCerrar = document.createElement('span');
    botonCerrar.innerHTML = ' ✕';
    botonCerrar.style.marginLeft = '10px';
    botonCerrar.style.cursor = 'pointer';
    botonCerrar.style.opacity = '0.8';
    botonCerrar.onclick = () => notificacion.remove();
    
    notificacion.appendChild(botonCerrar);
    document.body.appendChild(notificacion);
    
    // Auto-remover después de 4 segundos
    setTimeout(() => {
        if (notificacion.parentNode) {
            notificacion.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => notificacion.remove(), 300);
        }
    }, 4000);
}

// Agregar animación de salida al CSS dinámicamente
if (!document.querySelector('#admin-animations')) {
    const style = document.createElement('style');
    style.id = 'admin-animations';
    style.textContent = `
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

function actualizarEstadisticas() {
    const restaurantes = JSON.parse(localStorage.getItem('restaurantes')) || [];
    const totalRestaurantes = restaurantes.length || 8;
    animarNumero('#totalRestaurantes', totalRestaurantes);
}

function animarNumero(selector, valorFinal) {
    const elemento = document.querySelector(selector);
    if (!elemento) return;
    
    let valorActual = 0;
    const duracion = 2000; // 2 segundos
    const pasos = 60; // 60 frames
    const incremento = valorFinal / pasos;
    const intervalo = duracion / pasos;
    
    const timer = setInterval(() => {
        valorActual += incremento;
        if (valorActual >= valorFinal) {
            elemento.textContent = valorFinal;
            clearInterval(timer);
            
            // Agregar efecto de "bounce" al finalizar
            elemento.style.transform = 'scale(1.1)';
            setTimeout(() => {
                elemento.style.transform = 'scale(1)';
            }, 200);
        } else {
            elemento.textContent = Math.floor(valorActual);
        }
    }, intervalo);
}

function ejecutarAccionRapida(accion) {
    console.log(`Ejecutando acción: ${accion}`);
    
    switch(accion) {
        case 'agregar-restaurante':
            alert('Abriendo formulario para agregar nuevo restaurante...');
            break;
        case 'ver-restaurantes':
            mostrarListaRestaurantes();
            break;
        case 'agregar-plato':
            alert('Abriendo formulario para agregar nuevo plato...');
            break;
        case 'ver-platos':
            mostrarListaPlatos();
            break;
        case 'agregar-categoria-restaurante':
            alert('Abriendo formulario para agregar nueva categoría de restaurante...');
            break;
        case 'ver-categorias-restaurantes':
            mostrarListaCategoriasRestaurantes();
            break;
        case 'agregar-categoria-plato':
            alert('Abriendo formulario para agregar nueva categoría de plato...');
            break;
        case 'ver-categorias-platos':
            mostrarListaCategoriasPlatoss();
            break;
    }
}

function cerrarSesion() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        AuthAPI.logout().catch(err => console.error("Error en logout del backend:", err))
        .finally(() => {
            localStorage.clear();
            window.location.href = '../index.html';
        });
    }
}

// Funciones para el modal de lista de restaurantes
async function mostrarListaRestaurantes() {
    console.log('🍽️ Función mostrarListaRestaurantes llamada');
    
    const modal = document.getElementById('modalListaRestaurantes');
    const lista = document.getElementById('listaRestaurantes');
    
    console.log('Modal element:', modal);
    console.log('Lista element:', lista);
    
    if (!modal) {
        console.error('❌ Modal no encontrado');
        return;
    }
    
    // Mostrar el modal
    modal.style.display = 'flex';
    console.log('✅ Modal mostrado');
    
    // Mostrar loading
    lista.innerHTML = '<div class="loading">Cargando restaurantes...</div>';
    console.log('⏳ Loading mostrado');
    
    try {
        // Obtener restaurantes del backend
        const restaurantes = await RestaurantesAPI.getAll();
        
        // Limpiar la lista
        lista.innerHTML = '';
        
        if (restaurantes && restaurantes.length > 0) {
            // Crear lista de nombres con botones de acción
            restaurantes.forEach(restaurante => {
                const item = document.createElement('div');
                item.className = 'item-restaurante-con-botones';
                
                // Contenedor para el nombre
                const nombreContainer = document.createElement('div');
                nombreContainer.className = 'nombre-restaurante-item';
                nombreContainer.textContent = restaurante.nombre;
                
                // Contenedor para los botones
                const botonesContainer = document.createElement('div');
                botonesContainer.className = 'botones-accion-restaurante';
                
                // Botón editar
                const btnEditar = document.createElement('button');
                btnEditar.className = 'btn-editar-restaurante';
                btnEditar.innerHTML = '<span class="icono">✏️</span><span class="texto">Editar</span>';
                btnEditar.setAttribute('data-id', restaurante.id);
                btnEditar.setAttribute('title', 'Editar restaurante');
                
                // Botón eliminar
                const btnEliminar = document.createElement('button');
                btnEliminar.className = 'btn-eliminar-restaurante';
                btnEliminar.innerHTML = '<span class="icono">🗑️</span><span class="texto">Eliminar</span>';
                btnEliminar.setAttribute('data-id', restaurante.id);
                btnEliminar.setAttribute('title', 'Eliminar restaurante');
                
                // Agregar botones al contenedor
                botonesContainer.appendChild(btnEditar);
                botonesContainer.appendChild(btnEliminar);
                
                // Agregar nombre y botones al item
                item.appendChild(nombreContainer);
                item.appendChild(botonesContainer);
                
                lista.appendChild(item);
            });
        } else {
            lista.innerHTML = '<div class="empty-message">No hay restaurantes registrados</div>';
        }
        
    } catch (error) {
        console.error('Error al cargar restaurantes:', error);
        lista.innerHTML = '<div class="error-message">Error al cargar los restaurantes</div>';
    }
}

function cerrarModalListaRestaurantes() {
    console.log('🔒 Cerrando modal de lista de restaurantes');
    const modal = document.getElementById('modalListaRestaurantes');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Hacer función disponible globalmente para debugging
window.cerrarModalListaRestaurantes = cerrarModalListaRestaurantes;

// ===== FUNCIONES PARA GESTIÓN DE PLATOS =====
async function mostrarListaPlatos() {
    console.log('🍽️ Función mostrarListaPlatos llamada');
    
    const modal = document.getElementById('modalListaPlatos');
    const lista = document.getElementById('listaPlatos');
    
    if (!modal) {
        console.error('❌ Modal de platos no encontrado');
        return;
    }
    
    // Mostrar el modal
    modal.style.display = 'flex';
    
    // Mostrar loading
    lista.innerHTML = '<div class="loading">Cargando platos...</div>';
    
    try {
        // Obtener platos del backend
        const platos = await PlatosAPI.getAll();
        
        // Limpiar la lista
        lista.innerHTML = '';
        
        if (platos && platos.length > 0) {
            // Crear lista de platos con botones de acción
            platos.forEach(plato => {
                const item = document.createElement('div');
                item.className = 'item-restaurante-con-botones';
                
                // Contenedor para el nombre
                const nombreContainer = document.createElement('div');
                nombreContainer.className = 'nombre-restaurante-item';
                nombreContainer.textContent = `${plato.nombre} - $${plato.precio}`;
                
                // Contenedor para los botones
                const botonesContainer = document.createElement('div');
                botonesContainer.className = 'botones-accion-restaurante';
                
                // Botón editar
                const btnEditar = document.createElement('button');
                btnEditar.className = 'btn-editar-plato';
                btnEditar.innerHTML = '<span class="icono">✏️</span><span class="texto">Editar</span>';
                btnEditar.setAttribute('data-id', plato.id);
                btnEditar.setAttribute('title', 'Editar plato');
                
                // Botón eliminar
                const btnEliminar = document.createElement('button');
                btnEliminar.className = 'btn-eliminar-plato';
                btnEliminar.innerHTML = '<span class="icono">🗑️</span><span class="texto">Eliminar</span>';
                btnEliminar.setAttribute('data-id', plato.id);
                btnEliminar.setAttribute('title', 'Eliminar plato');
                
                // Agregar botones al contenedor
                botonesContainer.appendChild(btnEditar);
                botonesContainer.appendChild(btnEliminar);
                
                // Agregar nombre y botones al item
                item.appendChild(nombreContainer);
                item.appendChild(botonesContainer);
                
                lista.appendChild(item);
            });
        } else {
            lista.innerHTML = '<div class="empty-message">No hay platos registrados</div>';
        }
        
    } catch (error) {
        console.error('Error al cargar platos:', error);
        lista.innerHTML = '<div class="error-message">Error al cargar los platos</div>';
    }
}

function cerrarModalListaPlatos() {
    const modal = document.getElementById('modalListaPlatos');
    if (modal) {
        modal.style.display = 'none';
    }
}

// ===== FUNCIONES PARA GESTIÓN DE CATEGORÍAS DE RESTAURANTES =====
async function mostrarListaCategoriasRestaurantes() {
    console.log('🏷️ Función mostrarListaCategoriasRestaurantes llamada');
    
    const modal = document.getElementById('modalListaCategoriasRestaurantes');
    const lista = document.getElementById('listaCategoriasRestaurantes');
    
    if (!modal) {
        console.error('❌ Modal de categorías de restaurantes no encontrado');
        return;
    }
    
    // Mostrar el modal
    modal.style.display = 'flex';
    
    // Mostrar loading
    lista.innerHTML = '<div class="loading">Cargando categorías de restaurantes...</div>';
    
    try {
        // Obtener categorías del backend
        const categorias = await CategoriasRestaurantesAPI.obtenerTodas();
        console.log('Categorías de restaurantes cargadas:', categorias);
        
        // Limpiar la lista
        lista.innerHTML = '';
        
        if (categorias && categorias.length > 0) {
            // Crear lista de categorías con botones de acción
            categorias.forEach(categoria => {
                const item = document.createElement('div');
                item.className = 'item-restaurante-con-botones';
                
                // Contenedor para el nombre
                const nombreContainer = document.createElement('div');
                nombreContainer.className = 'nombre-restaurante-item';
                nombreContainer.textContent = categoria.nombre;
                
                // Contenedor para los botones
                const botonesContainer = document.createElement('div');
                botonesContainer.className = 'botones-accion-restaurante';
                
                // Botón editar
                const btnEditar = document.createElement('button');
                btnEditar.className = 'btn-editar-categoria-restaurante';
                btnEditar.innerHTML = '<span class="icono">✏️</span><span class="texto">Editar</span>';
                btnEditar.setAttribute('data-id', categoria.id);
                btnEditar.setAttribute('title', 'Editar categoría');
                
                // Botón eliminar
                const btnEliminar = document.createElement('button');
                btnEliminar.className = 'btn-eliminar-categoria-restaurante';
                btnEliminar.innerHTML = '<span class="icono">🗑️</span><span class="texto">Eliminar</span>';
                btnEliminar.setAttribute('data-id', categoria.id);
                btnEliminar.setAttribute('title', 'Eliminar categoría');
                
                // Agregar botones al contenedor
                botonesContainer.appendChild(btnEditar);
                botonesContainer.appendChild(btnEliminar);
                
                // Agregar nombre y botones al item
                item.appendChild(nombreContainer);
                item.appendChild(botonesContainer);
                
                lista.appendChild(item);
            });
        } else {
            lista.innerHTML = '<div class="empty-message">No hay categorías de restaurantes registradas</div>';
        }
        
    } catch (error) {
        console.error('Error al cargar categorías de restaurantes:', error);
        console.error('Error detallado:', error.message);
        lista.innerHTML = `<div class="error-message">Error al cargar las categorías de restaurantes<br><small>${error.message}</small></div>`;
    }
}

function cerrarModalListaCategoriasRestaurantes() {
    const modal = document.getElementById('modalListaCategoriasRestaurantes');
    if (modal) {
        modal.style.display = 'none';
    }
}

// ===== FUNCIONES PARA GESTIÓN DE CATEGORÍAS DE PLATOS =====
async function mostrarListaCategoriasPlatoss() {
    console.log('🏷️ Función mostrarListaCategoriasPlatoss llamada');
    
    const modal = document.getElementById('modalListaCategoriasPlatoss');
    const lista = document.getElementById('listaCategoriasPlatoss');
    
    if (!modal) {
        console.error('❌ Modal de categorías de platos no encontrado');
        return;
    }
    
    // Mostrar el modal
    modal.style.display = 'flex';
    
    // Mostrar loading
    lista.innerHTML = '<div class="loading">Cargando categorías de platos...</div>';
    
    try {
        // Obtener categorías del backend
        const categorias = await CategoriasPlatosAPI.obtenerTodas();
        console.log('Categorías de platos cargadas:', categorias);
        
        // Limpiar la lista
        lista.innerHTML = '';
        
        if (categorias && categorias.length > 0) {
            // Crear lista de categorías con botones de acción
            categorias.forEach(categoria => {
                const item = document.createElement('div');
                item.className = 'item-restaurante-con-botones';
                
                // Contenedor para el nombre
                const nombreContainer = document.createElement('div');
                nombreContainer.className = 'nombre-restaurante-item';
                nombreContainer.textContent = categoria.nombre;
                
                // Contenedor para los botones
                const botonesContainer = document.createElement('div');
                botonesContainer.className = 'botones-accion-restaurante';
                
                // Botón editar
                const btnEditar = document.createElement('button');
                btnEditar.className = 'btn-editar-categoria-plato';
                btnEditar.innerHTML = '<span class="icono">✏️</span><span class="texto">Editar</span>';
                btnEditar.setAttribute('data-id', categoria.id);
                btnEditar.setAttribute('title', 'Editar categoría');
                
                // Botón eliminar
                const btnEliminar = document.createElement('button');
                btnEliminar.className = 'btn-eliminar-categoria-plato';
                btnEliminar.innerHTML = '<span class="icono">🗑️</span><span class="texto">Eliminar</span>';
                btnEliminar.setAttribute('data-id', categoria.id);  
                btnEliminar.setAttribute('title', 'Eliminar categoría');
                
                // Agregar botones al contenedor
                botonesContainer.appendChild(btnEditar);
                botonesContainer.appendChild(btnEliminar);
                
                // Agregar nombre y botones al item
                item.appendChild(nombreContainer);
                item.appendChild(botonesContainer);
                
                lista.appendChild(item);
            });
        } else {
            lista.innerHTML = '<div class="empty-message">No hay categorías de platos registradas</div>';
        }
        
    } catch (error) {
        console.error('Error al cargar categorías de platos:', error);
        console.error('Error detallado:', error.message);
        lista.innerHTML = `<div class="error-message">Error al cargar las categorías de platos<br><small>${error.message}</small></div>`;
    }
}

function cerrarModalListaCategoriasPlatoss() {
    const modal = document.getElementById('modalListaCategoriasPlatoss');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Animaciones de entrada (opcional - mejora la experiencia si funciona)
window.addEventListener('load', function() {
    const tarjetas = document.querySelectorAll('.tarjeta-gestion');
    const estadisticas = document.querySelectorAll('.estadistica-item');
    
    // Solo aplicar animaciones si los elementos están ocultos
    estadisticas.forEach((stat, index) => {
        if (window.getComputedStyle(stat).opacity === '0') {
            setTimeout(() => {
                stat.style.opacity = '1';
                stat.style.transform = 'translateY(0) scale(1)';
            }, index * 200);
        }
    });
    
    tarjetas.forEach((tarjeta, index) => {
        if (window.getComputedStyle(tarjeta).opacity === '0') {
            setTimeout(() => {
                tarjeta.style.opacity = '1';
                tarjeta.style.transform = 'translateY(0)';
            }, (index * 300) + 500);
        }
    });
});