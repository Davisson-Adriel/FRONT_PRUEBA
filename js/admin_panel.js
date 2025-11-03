import { AuthAPI, RestaurantesAPI, PlatosAPI, ResenasRestaurantesAPI, ReseñasPlatosAPI, CategoriasRestaurantesAPI, CategoriasPlatosAPI, fetchAPI } from './api.js';

// Obtener nombre de administrador y cargar estadísticas
document.addEventListener('DOMContentLoaded', async function () {
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
    // Manejar clics en las tarjetas de gestión
    document.addEventListener('click', function (e) {

        // Clic en acciones rápidas
        if (e.target.closest('.boton-accion-rapida')) {
            const boton = e.target.closest('.boton-accion-rapida');
            const accion = boton.getAttribute('data-accion');

            try {
                ejecutarAccionRapida(accion);
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }

        // Clics en botones de restaurantes
        if (e.target.closest('.btn-eliminar-restaurante')) {
            const boton = e.target.closest('.btn-eliminar-restaurante');
            const id = boton.getAttribute('data-id');
            eliminarRestaurante(id);
        }

        if (e.target.closest('.btn-editar-restaurante')) {
            const boton = e.target.closest('.btn-editar-restaurante');
            const id = boton.getAttribute('data-id');
            editarRestaurante(id);
        }

        // Clics en botones de platos
        if (e.target.closest('.btn-eliminar-plato')) {
            const boton = e.target.closest('.btn-eliminar-plato');
            const id = boton.getAttribute('data-id');
            eliminarPlato(id);
        }

        if (e.target.closest('.btn-editar-plato')) {
            const boton = e.target.closest('.btn-editar-plato');
            const id = boton.getAttribute('data-id');
            editarPlato(id);
        }

        // Clics en botones de categorías de restaurantes
        if (e.target.closest('.btn-eliminar-categoria-restaurante')) {
            const boton = e.target.closest('.btn-eliminar-categoria-restaurante');
            const id = boton.getAttribute('data-id');
            eliminarCategoriaRestaurante(id);
        }

        if (e.target.closest('.btn-editar-categoria-restaurante')) {
            const boton = e.target.closest('.btn-editar-categoria-restaurante');
            const id = boton.getAttribute('data-id');
            editarCategoriaRestaurante(id);
        }

        // Clics en botones de categorías de platos
        if (e.target.closest('.btn-eliminar-categoria-plato')) {
            const boton = e.target.closest('.btn-eliminar-categoria-plato');
            const id = boton.getAttribute('data-id');
            eliminarCategoriaPlato(id);
        }

        if (e.target.closest('.btn-editar-categoria-plato')) {
            const boton = e.target.closest('.btn-editar-categoria-plato');
            const id = boton.getAttribute('data-id');
            editarCategoriaPlato(id);
        }
    });

    // Event listener para cerrar modal de restaurantes
    const btnCerrarModal = document.getElementById('btnCerrarModalRestaurantes');
    if (btnCerrarModal) {
        btnCerrarModal.addEventListener('click', function () {
            cerrarModalListaRestaurantes();
        });
    }

    // Event listener para cerrar modal al hacer clic fuera del contenido
    const modalListaRestaurantes = document.getElementById('modalListaRestaurantes');
    if (modalListaRestaurantes) {
        modalListaRestaurantes.addEventListener('click', function (e) {
            if (e.target === modalListaRestaurantes) {
                cerrarModalListaRestaurantes();
            }
        });
    }

    // Event listeners para modal de platos
    const btnCerrarModalPlatos = document.getElementById('btnCerrarModalPlatos');
    if (btnCerrarModalPlatos) {
        btnCerrarModalPlatos.addEventListener('click', function () {
            cerrarModalListaPlatos();
        });
    }

    const modalListaPlatos = document.getElementById('modalListaPlatos');
    if (modalListaPlatos) {
        modalListaPlatos.addEventListener('click', function (e) {
            if (e.target === modalListaPlatos) {
                cerrarModalListaPlatos();
            }
        });
    }

    // Event listeners para modal de categorías de restaurantes
    const btnCerrarModalCategoriasRestaurantes = document.getElementById('btnCerrarModalCategoriasRestaurantes');
    if (btnCerrarModalCategoriasRestaurantes) {
        btnCerrarModalCategoriasRestaurantes.addEventListener('click', function () {
            cerrarModalListaCategoriasRestaurantes();
        });
    }

    const modalListaCategoriasRestaurantes = document.getElementById('modalListaCategoriasRestaurantes');
    if (modalListaCategoriasRestaurantes) {
        modalListaCategoriasRestaurantes.addEventListener('click', function (e) {
            if (e.target === modalListaCategoriasRestaurantes) {
                cerrarModalListaCategoriasRestaurantes();
            }
        });
    }

    // Event listeners para modal de categorías de platos
    const btnCerrarModalCategoriasPlatoss = document.getElementById('btnCerrarModalCategoriasPlatoss');
    if (btnCerrarModalCategoriasPlatoss) {
        btnCerrarModalCategoriasPlatoss.addEventListener('click', function () {
            cerrarModalListaCategoriasPlatoss();
        });
    }

    const modalListaCategoriasPlatoss = document.getElementById('modalListaCategoriasPlatoss');
    if (modalListaCategoriasPlatoss) {
        modalListaCategoriasPlatoss.addEventListener('click', function (e) {
            if (e.target === modalListaCategoriasPlatoss) {
                cerrarModalListaCategoriasPlatoss();
            }
        });
    }
}

// Función para cargar estadísticas reales del backend
async function cargarEstadisticasDelBackend() {
    try {
        // Mostrar indicadores de carga
        document.getElementById('totalRestaurantes').innerHTML = '<span class="loading-dot">•••</span>';
        document.getElementById('totalPlatos').innerHTML = '<span class="loading-dot">•••</span>';
        document.getElementById('totalResenas').innerHTML = '<span class="loading-dot">•••</span>';

        // Obtener datos en paralelo para mejor rendimiento
        const [restaurantes, platos, resenasRestaurantes, resenasPlatos] = await Promise.all([
            RestaurantesAPI.getAll().catch(err => {
                return [];
            }),
            PlatosAPI.getAll().catch(err => {
                return [];
            }),
            ResenasRestaurantesAPI.obtenerTodas().catch(err => {
                return [];
            }),
            ReseñasPlatosAPI.obtenerTodas().catch(err => {
                return [];
            })
        ]);

        // Calcular totales
        const totalRestaurantes = restaurantes.length;
        const totalPlatos = platos.length;
        const totalResenas = resenasRestaurantes.length + resenasPlatos.length;

        // Mostrar los números directamente sin animación
        document.getElementById('totalRestaurantes').textContent = totalRestaurantes;
        document.getElementById('totalPlatos').textContent = totalPlatos;
        document.getElementById('totalResenas').textContent = totalResenas;

        // Guardar timestamp de última actualización
        localStorage.setItem('ultimaActualizacionEstadisticas', new Date().toISOString());

    } catch (error) {
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
    switch (modulo) {
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

function ejecutarAccionRapida(accion) {
    switch (accion) {
        case 'agregar-restaurante':
            mostrarModalAgregarRestaurante();
            break;
        case 'ver-restaurantes':
            mostrarListaRestaurantes();
            break;
        case 'agregar-plato':
            mostrarModalAgregarPlato();
            break;
        case 'ver-platos':
            mostrarListaPlatos();
            break;
        case 'agregar-categoria-restaurante':
            mostrarModalAgregarCategoriaRestaurante();
            break;
        case 'ver-categorias-restaurantes':
            mostrarListaCategoriasRestaurantes();
            break;
        case 'agregar-categoria-plato':
            mostrarModalAgregarCategoriaPlato();
            break;
        case 'ver-categorias-platos':
            mostrarListaCategoriasPlatoss();
            break;
    }
}

function cerrarSesion() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        AuthAPI.logout().catch(err => { })
            .finally(() => {
                localStorage.clear();
                window.location.href = '../index.html';
            });
    }
}

// Funciones para el modal de lista de restaurantes
async function mostrarListaRestaurantes() {
    const modal = document.getElementById('modalListaRestaurantes');
    const lista = document.getElementById('listaRestaurantes');

    if (!modal) {
        return;
    }

    // Mostrar el modal
    modal.style.display = 'flex';

    // Mostrar loading
    lista.innerHTML = '<div class="loading">Cargando restaurantes...</div>';

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
        lista.innerHTML = '<div class="error-message">Error al cargar los restaurantes</div>';
    }
}

function cerrarModalListaRestaurantes() {
    const modal = document.getElementById('modalListaRestaurantes');
    if (modal) {
        modal.style.display = 'none';
    }
}

// ===== FUNCIONES PARA GESTIÓN DE PLATOS =====
async function mostrarListaPlatos() {
    const modal = document.getElementById('modalListaPlatos');
    const lista = document.getElementById('listaPlatos');

    if (!modal) {
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
    const modal = document.getElementById('modalListaCategoriasRestaurantes');
    const lista = document.getElementById('listaCategoriasRestaurantes');

    if (!modal) {
        return;
    }

    // Mostrar el modal
    modal.style.display = 'flex';

    // Mostrar loading
    lista.innerHTML = '<div class="loading">Cargando categorías de restaurantes...</div>';

    try {
        // Obtener categorías del backend
        const categorias = await CategoriasRestaurantesAPI.obtenerTodas();

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
    const modal = document.getElementById('modalListaCategoriasPlatoss');
    const lista = document.getElementById('listaCategoriasPlatoss');

    if (!modal) {
        return;
    }

    // Mostrar el modal
    modal.style.display = 'flex';

    // Mostrar loading
    lista.innerHTML = '<div class="loading">Cargando categorías de platos...</div>';

    try {
        // Obtener categorías del backend
        const categorias = await CategoriasPlatosAPI.obtenerTodas();

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
        lista.innerHTML = `<div class="error-message">Error al cargar las categorías de platos<br><small>${error.message}</small></div>`;
    }
}

function cerrarModalListaCategoriasPlatoss() {
    const modal = document.getElementById('modalListaCategoriasPlatoss');
    if (modal) {
        modal.style.display = 'none';
    }
}

// ===== FUNCIONES DE EDICIÓN =====

// Función para editar restaurante
async function editarRestaurante(id) {
    try {
        // Obtener datos del restaurante usando el endpoint individual
        const restaurante = await RestaurantesAPI.getById(id);

        // Obtener categorías para el select
        const categorias = await CategoriasRestaurantesAPI.obtenerTodas();

        // Mostrar modal
        const modal = document.getElementById('modalEditarRestaurante');
        modal.style.display = 'flex';

        // Llenar el formulario
        document.getElementById('editRestauranteId').value = restaurante.id;
        document.getElementById('editRestauranteNombre').value = restaurante.nombre || '';
        document.getElementById('editRestauranteDireccion').value = restaurante.direccion || '';
        document.getElementById('editRestauranteImagenUrl').value = restaurante.imagen_url || '';
        document.getElementById('editRestauranteDescripcion').value = restaurante.descripcion || '';

        // Llenar select de categorías
        const selectCategoria = document.getElementById('editRestauranteCategoriaId');
        selectCategoria.innerHTML = '<option value="">Selecciona una categoría</option>';
        categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.id;
            option.textContent = categoria.nombre;
            option.selected = categoria.id == restaurante.categoriaId;
            selectCategoria.appendChild(option);
        });

        // Configurar event listeners del formulario
        setupEditarRestauranteListeners();

    } catch (error) {
        alert('Error al cargar los datos del restaurante: ' + error.message);
    }
}

// Función para editar plato
async function editarPlato(id) {
    try {
        // Obtener datos del plato (usa fallback si el endpoint individual falla)
        const plato = await PlatosAPI.getById(id);

        if (!plato) {
            alert('Plato no encontrado');
            return;
        }

        // Obtener categorías y restaurantes para los selects
        const [categorias, restaurantes] = await Promise.all([
            CategoriasPlatosAPI.obtenerTodas(),
            RestaurantesAPI.getAll()
        ]);

        // Mostrar modal
        const modal = document.getElementById('modalEditarPlato');
        modal.style.display = 'flex';

        // Llenar el formulario
        document.getElementById('editPlatoId').value = plato.id;
        document.getElementById('editPlatoNombre').value = plato.nombre || '';
        document.getElementById('editPlatoPrecio').value = plato.precio || '';
        document.getElementById('editPlatoImagenUrl').value = plato.imagen_url || '';
        document.getElementById('editPlatoDescripcion').value = plato.descripcion || '';

        // Llenar select de categorías
        const selectCategoria = document.getElementById('editPlatoCategoriaId');
        selectCategoria.innerHTML = '<option value="">Selecciona una categoría</option>';
        categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.id;
            option.textContent = categoria.nombre;
            option.selected = categoria.id == plato.categoriaId;
            selectCategoria.appendChild(option);
        });

        // Llenar select de restaurantes
        const selectRestaurante = document.getElementById('editPlatoRestauranteId');
        selectRestaurante.innerHTML = '<option value="">Selecciona un restaurante</option>';
        restaurantes.forEach(restaurante => {
            const option = document.createElement('option');
            option.value = restaurante.id;
            option.textContent = restaurante.nombre;
            option.selected = restaurante.id == plato.id_restaurante;
            selectRestaurante.appendChild(option);
        });

        // Configurar event listeners del formulario
        setupEditarPlatoListeners();

    } catch (error) {
        alert('Error al cargar los datos del plato: ' + error.message);
    }
}

// Función para editar categoría de restaurante
async function editarCategoriaRestaurante(id) {
    try {
        // Obtener datos de la categoría usando el endpoint individual
        const categoria = await CategoriasRestaurantesAPI.obtenerPorId(id);

        // Mostrar modal
        const modal = document.getElementById('modalEditarCategoriaRestaurante');
        modal.style.display = 'flex';

        // Llenar el formulario
        document.getElementById('editCategoriaRestauranteId').value = categoria.id;
        document.getElementById('editCategoriaRestauranteNombre').value = categoria.nombre || '';

        // Configurar event listeners del formulario
        setupEditarCategoriaRestauranteListeners();

    } catch (error) {
        alert('Error al cargar los datos de la categoría: ' + error.message);
    }
}

// Función para editar categoría de plato
async function editarCategoriaPlato(id) {
    try {
        // Obtener datos de la categoría usando el endpoint individual
        const categoria = await CategoriasPlatosAPI.obtenerPorId(id);

        // Mostrar modal
        const modal = document.getElementById('modalEditarCategoriaPlato');
        modal.style.display = 'flex';

        // Llenar el formulario
        document.getElementById('editCategoriaPlatoId').value = categoria.id;
        document.getElementById('editCategoriaPlatoNombre').value = categoria.nombre || '';

        // Configurar event listeners del formulario
        setupEditarCategoriaPlatoListeners();

    } catch (error) {
        alert('Error al cargar los datos de la categoría: ' + error.message);
    }
}

// ===== SETUP DE EVENT LISTENERS PARA FORMULARIOS =====

function setupEditarRestauranteListeners() {
    // Botón cerrar modal
    document.getElementById('btnCerrarModalEditarRestaurante').onclick = cerrarModalEditarRestaurante;
    document.getElementById('btnCancelarEditarRestaurante').onclick = cerrarModalEditarRestaurante;

    // Formulario submit
    const form = document.getElementById('formEditarRestaurante');
    form.onsubmit = async function (e) {
        e.preventDefault();
        await guardarRestauranteEditado();
    };
}

function setupEditarPlatoListeners() {
    // Botón cerrar modal
    document.getElementById('btnCerrarModalEditarPlato').onclick = cerrarModalEditarPlato;
    document.getElementById('btnCancelarEditarPlato').onclick = cerrarModalEditarPlato;

    // Formulario submit
    const form = document.getElementById('formEditarPlato');
    form.onsubmit = async function (e) {
        e.preventDefault();
        await guardarPlatoEditado();
    };
}

function setupEditarCategoriaRestauranteListeners() {
    // Botón cerrar modal
    document.getElementById('btnCerrarModalEditarCategoriaRestaurante').onclick = cerrarModalEditarCategoriaRestaurante;
    document.getElementById('btnCancelarEditarCategoriaRestaurante').onclick = cerrarModalEditarCategoriaRestaurante;

    // Formulario submit
    const form = document.getElementById('formEditarCategoriaRestaurante');
    form.onsubmit = async function (e) {
        e.preventDefault();
        await guardarCategoriaRestauranteEditada();
    };
}

function setupEditarCategoriaPlatoListeners() {
    // Botón cerrar modal
    document.getElementById('btnCerrarModalEditarCategoriaPlato').onclick = cerrarModalEditarCategoriaPlato;
    document.getElementById('btnCancelarEditarCategoriaPlato').onclick = cerrarModalEditarCategoriaPlato;

    // Formulario submit
    const form = document.getElementById('formEditarCategoriaPlato');
    form.onsubmit = async function (e) {
        e.preventDefault();
        await guardarCategoriaPlatoEditada();
    };
}

// ===== FUNCIONES PARA CERRAR MODALES =====

function cerrarModalEditarRestaurante() {
    document.getElementById('modalEditarRestaurante').style.display = 'none';
}

function cerrarModalEditarPlato() {
    document.getElementById('modalEditarPlato').style.display = 'none';
}

function cerrarModalEditarCategoriaRestaurante() {
    document.getElementById('modalEditarCategoriaRestaurante').style.display = 'none';
}

function cerrarModalEditarCategoriaPlato() {
    document.getElementById('modalEditarCategoriaPlato').style.display = 'none';
}

// ===== FUNCIONES PARA GUARDAR CAMBIOS =====

async function guardarRestauranteEditado() {
    try {
        const form = document.getElementById('formEditarRestaurante');
        const formData = new FormData(form);

        const restauranteData = {
            nombre: formData.get('nombre'),
            categoriaId: parseInt(formData.get('categoriaId')),
            direccion: formData.get('direccion'),
            imagen_url: formData.get('imagen_url'),
            descripcion: formData.get('descripcion')
        };

        const id = document.getElementById('editRestauranteId').value;

        await RestaurantesAPI.update(id, restauranteData);

        alert('Restaurante actualizado exitosamente');
        cerrarModalEditarRestaurante();

        // Recargar la lista si está abierta
        if (document.getElementById('modalListaRestaurantes').style.display === 'flex') {
            await mostrarListaRestaurantes();
        }

        // Actualizar estadísticas
        await cargarEstadisticasDelBackend();

    } catch (error) {
        alert('Error al actualizar el restaurante: ' + error.message);
    }
}

async function guardarPlatoEditado() {
    try {
        const form = document.getElementById('formEditarPlato');
        const formData = new FormData(form);

        const platoData = {
            nombre: formData.get('nombre'),
            categoriaId: parseInt(formData.get('categoriaId')),
            precio: parseFloat(formData.get('precio')),
            id_restaurante: parseInt(formData.get('id_restaurante')),
            imagen_url: formData.get('imagen_url'),
            descripcion: formData.get('descripcion')
        };

        const id = document.getElementById('editPlatoId').value;

        await PlatosAPI.update(id, platoData);

        alert('Plato actualizado exitosamente');
        cerrarModalEditarPlato();

        // Recargar la lista si está abierta
        if (document.getElementById('modalListaPlatos').style.display === 'flex') {
            await mostrarListaPlatos();
        }

        // Actualizar estadísticas
        await cargarEstadisticasDelBackend();

    } catch (error) {
        alert('Error al actualizar el plato: ' + error.message);
    }
}

async function guardarCategoriaRestauranteEditada() {
    try {
        const form = document.getElementById('formEditarCategoriaRestaurante');
        const formData = new FormData(form);

        const categoriaData = {
            nombre: formData.get('nombre')
        };

        const id = document.getElementById('editCategoriaRestauranteId').value;

        // Necesitamos agregar el método update a la API de categorías
        const response = await fetch(`http://localhost:5000/categorias_restaurantes/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(categoriaData)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        alert('Categoría actualizada exitosamente');
        cerrarModalEditarCategoriaRestaurante();

        // Recargar la lista si está abierta
        if (document.getElementById('modalListaCategoriasRestaurantes').style.display === 'flex') {
            await mostrarListaCategoriasRestaurantes();
        }

        // Actualizar estadísticas
        await cargarEstadisticasDelBackend();

    } catch (error) {
        alert('Error al actualizar la categoría: ' + error.message);
    }
}

async function guardarCategoriaPlatoEditada() {
    try {
        const form = document.getElementById('formEditarCategoriaPlato');
        const formData = new FormData(form);

        const categoriaData = {
            nombre: formData.get('nombre')
        };

        const id = document.getElementById('editCategoriaPlatoId').value;

        const response = await fetchAPI(`/categorias_restaurantes/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(categoriaData)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        alert('Categoría actualizada exitosamente');
        cerrarModalEditarCategoriaPlato();

        // Recargar la lista si está abierta
        if (document.getElementById('modalListaCategoriasPlatoss').style.display === 'flex') {
            await mostrarListaCategoriasPlatoss();
        }

        // Actualizar estadísticas
        await cargarEstadisticasDelBackend();

    } catch (error) {
        alert('Error al actualizar la categoría: ' + error.message);
    }
}

// ===== FUNCIONES PARA MODALES DE CREACIÓN =====

// Función para mostrar modal de agregar restaurante
async function mostrarModalAgregarRestaurante() {
    try {
        // Obtener categorías para el select
        const categorias = await CategoriasRestaurantesAPI.obtenerTodas();

        // Mostrar modal
        const modal = document.getElementById('modalAgregarRestaurante');
        modal.style.display = 'flex';

        // Limpiar el formulario
        document.getElementById('formAgregarRestaurante').reset();

        // Llenar select de categorías
        const selectCategoria = document.getElementById('nuevoRestauranteCategoriaId');
        selectCategoria.innerHTML = '<option value="">Selecciona una categoría</option>';
        categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.id;
            option.textContent = categoria.nombre;
            selectCategoria.appendChild(option);
        });

        // Configurar event listeners del formulario
        setupFormularioAgregarRestaurante();

    } catch (error) {
        alert('Error al cargar las categorías: ' + error.message);
    }
}

// Función para mostrar modal de agregar plato
async function mostrarModalAgregarPlato() {
    try {
        // Obtener categorías y restaurantes para los selects
        const [categorias, restaurantes] = await Promise.all([
            CategoriasPlatosAPI.obtenerTodas(),
            RestaurantesAPI.getAll()
        ]);

        // Mostrar modal
        const modal = document.getElementById('modalAgregarPlato');
        modal.style.display = 'flex';

        // Limpiar el formulario
        document.getElementById('formAgregarPlato').reset();

        // Llenar select de categorías
        const selectCategoria = document.getElementById('nuevoPlatoCategoriaId');
        selectCategoria.innerHTML = '<option value="">Selecciona una categoría</option>';
        categorias.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria.id;
            option.textContent = categoria.nombre;
            selectCategoria.appendChild(option);
        });

        // Llenar select de restaurantes
        const selectRestaurante = document.getElementById('nuevoPlatoRestauranteId');
        selectRestaurante.innerHTML = '<option value="">Selecciona un restaurante</option>';
        restaurantes.forEach(restaurante => {
            const option = document.createElement('option');
            option.value = restaurante.id;
            option.textContent = restaurante.nombre;
            selectRestaurante.appendChild(option);
        });

        // Configurar event listeners del formulario
        setupFormularioAgregarPlato();

    } catch (error) {
        alert('Error al cargar los datos: ' + error.message);
    }
}

// Función para mostrar modal de agregar categoría de restaurante
function mostrarModalAgregarCategoriaRestaurante() {
    // Mostrar modal
    const modal = document.getElementById('modalAgregarCategoriaRestaurante');
    modal.style.display = 'flex';

    // Limpiar el formulario
    document.getElementById('formAgregarCategoriaRestaurante').reset();

    // Configurar event listeners del formulario
    setupFormularioAgregarCategoriaRestaurante();
}

// Función para mostrar modal de agregar categoría de plato
function mostrarModalAgregarCategoriaPlato() {
    // Mostrar modal
    const modal = document.getElementById('modalAgregarCategoriaPlato');
    modal.style.display = 'flex';

    // Limpiar el formulario
    document.getElementById('formAgregarCategoriaPlato').reset();

    // Configurar event listeners del formulario
    setupFormularioAgregarCategoriaPlato();
}

// ===== CONFIGURACIÓN DE FORMULARIOS =====

function setupFormularioAgregarRestaurante() {
    // Botón cerrar
    document.getElementById('btnCerrarModalAgregarRestaurante').onclick = () => {
        document.getElementById('modalAgregarRestaurante').style.display = 'none';
    };

    // Botón cancelar
    document.getElementById('btnCancelarAgregarRestaurante').onclick = () => {
        document.getElementById('modalAgregarRestaurante').style.display = 'none';
    };

    // Envío del formulario
    const form = document.getElementById('formAgregarRestaurante');
    form.onsubmit = async (e) => {
        e.preventDefault();
        await crearRestaurante();
    };
}

function setupFormularioAgregarPlato() {
    // Botón cerrar
    document.getElementById('btnCerrarModalAgregarPlato').onclick = () => {
        document.getElementById('modalAgregarPlato').style.display = 'none';
    };

    // Botón cancelar
    document.getElementById('btnCancelarAgregarPlato').onclick = () => {
        document.getElementById('modalAgregarPlato').style.display = 'none';
    };

    // Envío del formulario
    const form = document.getElementById('formAgregarPlato');
    form.onsubmit = async (e) => {
        e.preventDefault();
        await crearPlato();
    };
}

function setupFormularioAgregarCategoriaRestaurante() {
    // Botón cerrar
    document.getElementById('btnCerrarModalAgregarCategoriaRestaurante').onclick = () => {
        document.getElementById('modalAgregarCategoriaRestaurante').style.display = 'none';
    };

    // Botón cancelar
    document.getElementById('btnCancelarAgregarCategoriaRestaurante').onclick = () => {
        document.getElementById('modalAgregarCategoriaRestaurante').style.display = 'none';
    };

    // Envío del formulario
    const form = document.getElementById('formAgregarCategoriaRestaurante');
    form.onsubmit = async (e) => {
        e.preventDefault();
        await crearCategoriaRestaurante();
    };
}

function setupFormularioAgregarCategoriaPlato() {
    // Botón cerrar
    document.getElementById('btnCerrarModalAgregarCategoriaPlato').onclick = () => {
        document.getElementById('modalAgregarCategoriaPlato').style.display = 'none';
    };

    // Botón cancelar
    document.getElementById('btnCancelarAgregarCategoriaPlato').onclick = () => {
        document.getElementById('modalAgregarCategoriaPlato').style.display = 'none';
    };

    // Envío del formulario
    const form = document.getElementById('formAgregarCategoriaPlato');
    form.onsubmit = async (e) => {
        e.preventDefault();
        await crearCategoriaPlato();
    };
}

// ===== FUNCIONES DE CREACIÓN =====

async function crearRestaurante() {
    try {
        const form = document.getElementById('formAgregarRestaurante');
        const formData = new FormData(form);
        const defaultImageUrl = 'https://placehold.co/400x250/ccc/333?text=Imagen+por+Defecto';
        const defaultDescription = 'Descripción no proporcionada por el administrador.';

        const restauranteData = {
            nombre: formData.get('nombre'),
            direccion: formData.get('direccion'),
            categoriaId: parseInt(formData.get('categoriaId')),
            imagen_url: formData.get('imagen_url') || defaultImageUrl,
            descripcion: formData.get('descripcion') || defaultDescription
        };

        console.log("Enviando datos del restaurante:", restauranteData);

        const nuevoRestaurante = await RestaurantesAPI.create(restauranteData);

        alert('¡Restaurante creado exitosamente!');

        document.getElementById('modalAgregarRestaurante').style.display = 'none';
        await cargarEstadisticasDelBackend();

    } catch (error) {
        console.error("Error detallado al crear restaurante:", error);
        alert('Error al crear el restaurante: ' + error.message);
    }
}

async function crearPlato() {
    try {
        const form = document.getElementById('formAgregarPlato');
        const formData = new FormData(form);

        const defaultImageUrl = 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=250&fit=crop&crop=center';
        const defaultDescription = 'Plato no descrito.';

        const platoData = {
            nombre: formData.get('nombre'),
            precio: parseFloat(formData.get('precio')),
            id_restaurante: parseInt(formData.get('restauranteId')),
            categoriaId: parseInt(formData.get('categoriaId')),
            imagen_url: formData.get('imagen_url') || defaultImageUrl,
            descripcion: formData.get('descripcion') || defaultDescription
        };

        const nuevoPlato = await PlatosAPI.create(platoData);

        alert('¡Plato creado exitosamente!');

        // Cerrar modal y actualizar estadísticas
        document.getElementById('modalAgregarPlato').style.display = 'none';
        await cargarEstadisticasDelBackend();

    } catch (error) {
        alert('Error al crear el plato: ' + error.message);
    }
}

async function crearCategoriaRestaurante() {
    try {
        const form = document.getElementById('formAgregarCategoriaRestaurante');
        const formData = new FormData(form);

        const categoriaData = {
            nombre: formData.get('nombre')
        };

        const nuevaCategoria = await CategoriasRestaurantesAPI.crear(categoriaData);

        alert('¡Categoría de restaurante creada exitosamente!');

        // Cerrar modal
        document.getElementById('modalAgregarCategoriaRestaurante').style.display = 'none';

    } catch (error) {
        alert('Error al crear la categoría: ' + error.message);
    }
}

async function crearCategoriaPlato() {
    try {
        const form = document.getElementById('formAgregarCategoriaPlato');
        const formData = new FormData(form);

        const categoriaData = {
            nombre: formData.get('nombre')
        };

        const nuevaCategoria = await CategoriasPlatosAPI.crear(categoriaData);

        alert('¡Categoría de plato creada exitosamente!');

        // Cerrar modal
        document.getElementById('modalAgregarCategoriaPlato').style.display = 'none';

    } catch (error) {
        alert('Error al crear la categoría: ' + error.message);
    }
}

// ========================
// FUNCIONES DE ELIMINACIÓN
// ========================

// Constantes para categorías por defecto
const CATEGORIAS_POR_DEFECTO = {
    RESTAURANTES: 'General',
    PLATOS: 'Sin categoría'
};

// Función para eliminar restaurante (con eliminación en cascada de platos)
async function eliminarRestaurante(id) {
    try {
        // Confirmar eliminación
        const confirmacion = confirm(
            '⚠️ ATENCIÓN: Al eliminar este restaurante también se eliminarán todos sus platos asociados.\n\n' +
            '¿Estás seguro de que deseas continuar?'
        );

        if (!confirmacion) return;

        // Obtener platos del restaurante para mostrar información
        const platos = await PlatosAPI.getByRestaurante(id);

        if (platos.length > 0) {
            const segundaConfirmacion = confirm(
                `Este restaurante tiene ${platos.length} plato(s) asociado(s) que también serán eliminados:\n\n` +
                platos.map(p => `• ${p.nombre}`).join('\n') + '\n\n' +
                '¿Continuar con la eliminación?'
            );

            if (!segundaConfirmacion) return;

            // Eliminar todos los platos asociados primero
            for (const plato of platos) {
                await PlatosAPI.delete(plato.id);
            }
        }

        // Eliminar el restaurante
        await RestaurantesAPI.delete(id);

        alert('✅ Restaurante y platos asociados eliminados exitosamente');

        // Recargar la lista de restaurantes
        mostrarListaRestaurantes();

    } catch (error) {
        console.error('Error al eliminar restaurante:', error);
        alert('❌ Error al eliminar el restaurante: ' + error.message);
    }
}

// Función para eliminar plato
async function eliminarPlato(id) {
    try {
        // Confirmar eliminación
        const confirmacion = confirm(
            '¿Estás seguro de que deseas eliminar este plato?\n\n' +
            'Esta acción no se puede deshacer.'
        );

        if (!confirmacion) return;

        // Eliminar el plato
        await PlatosAPI.delete(id);

        alert('✅ Plato eliminado exitosamente');

        // Recargar la lista de platos
        mostrarListaPlatos();

    } catch (error) {
        console.error('Error al eliminar plato:', error);
        alert('❌ Error al eliminar el plato: ' + error.message);
    }
}

// Función para eliminar categoría de restaurante (con reasignación a categoría por defecto)
async function eliminarCategoriaRestaurante(id) {
    try {
        // Obtener información de la categoría a eliminar
        const categoria = await CategoriasRestaurantesAPI.obtenerPorId(id);

        // Obtener restaurantes que usan esta categoría
        const restaurantes = await RestaurantesAPI.getAll();
        const restaurantesAfectados = restaurantes.filter(r => r.id_categoria_restaurante == id);

        if (restaurantesAfectados.length > 0) {
            // Buscar o crear categoría por defecto
            const categorias = await CategoriasRestaurantesAPI.obtenerTodas();
            let categoriaDefecto = categorias.find(c => c.nombre === CATEGORIAS_POR_DEFECTO.RESTAURANTES);

            if (!categoriaDefecto) {
                // Crear categoría por defecto si no existe
                categoriaDefecto = await CategoriasRestaurantesAPI.crear({
                    nombre: CATEGORIAS_POR_DEFECTO.RESTAURANTES
                });
            }

            // Confirmar eliminación con información de reasignación
            const confirmacion = confirm(
                `⚠️ Esta categoría está siendo utilizada por ${restaurantesAfectados.length} restaurante(s):\n\n` +
                restaurantesAfectados.map(r => `• ${r.nombre}`).join('\n') + '\n\n' +
                `Los restaurantes serán reasignados a la categoría "${CATEGORIAS_POR_DEFECTO.RESTAURANTES}".\n\n` +
                '¿Continuar con la eliminación?'
            );

            if (!confirmacion) return;

            // Reasignar restaurantes a categoría por defecto
            for (const restaurante of restaurantesAfectados) {
                await RestaurantesAPI.update(restaurante.id, {
                    ...restaurante,
                    id_categoria_restaurante: categoriaDefecto.id
                });
            }
        } else {
            // Confirmación simple si no hay restaurantes afectados
            const confirmacion = confirm(
                '¿Estás seguro de que deseas eliminar esta categoría?\n\n' +
                'Esta acción no se puede deshacer.'
            );

            if (!confirmacion) return;
        }

        // Eliminar la categoría
        await CategoriasRestaurantesAPI.eliminar(id);

        const mensaje = restaurantesAfectados.length > 0
            ? `✅ Categoría eliminada y ${restaurantesAfectados.length} restaurante(s) reasignado(s) exitosamente`
            : '✅ Categoría eliminada exitosamente';

        alert(mensaje);

        // Recargar las listas
        mostrarListaCategoriasRestaurantes();
        if (restaurantesAfectados.length > 0) {
            mostrarListaRestaurantes();
        }

    } catch (error) {
        console.error('Error al eliminar categoría de restaurante:', error);
        alert('❌ Error al eliminar la categoría: ' + error.message);
    }
}

// Función para eliminar categoría de plato (con reasignación a categoría por defecto)
async function eliminarCategoriaPlato(id) {
    try {
        // Obtener información de la categoría a eliminar
        const categoria = await CategoriasPlatosAPI.obtenerPorId(id);

        // Obtener platos que usan esta categoría
        const platos = await PlatosAPI.getAll();
        const platosAfectados = platos.filter(p => p.id_categoria_plato == id);

        if (platosAfectados.length > 0) {
            // Buscar o crear categoría por defecto
            const categorias = await CategoriasPlatosAPI.obtenerTodas();
            let categoriaDefecto = categorias.find(c => c.nombre === CATEGORIAS_POR_DEFECTO.PLATOS);

            if (!categoriaDefecto) {
                // Crear categoría por defecto si no existe
                categoriaDefecto = await CategoriasPlatosAPI.crear({
                    nombre: CATEGORIAS_POR_DEFECTO.PLATOS
                });
            }

            // Confirmar eliminación con información de reasignación
            const confirmacion = confirm(
                `⚠️ Esta categoría está siendo utilizada por ${platosAfectados.length} plato(s):\n\n` +
                platosAfectados.map(p => `• ${p.nombre}`).join('\n') + '\n\n' +
                `Los platos serán reasignados a la categoría "${CATEGORIAS_POR_DEFECTO.PLATOS}".\n\n` +
                '¿Continuar con la eliminación?'
            );

            if (!confirmacion) return;

            // Reasignar platos a categoría por defecto
            for (const plato of platosAfectados) {
                await PlatosAPI.update(plato.id, {
                    ...plato,
                    id_categoria_plato: categoriaDefecto.id
                });
            }
        } else {
            // Confirmación simple si no hay platos afectados
            const confirmacion = confirm(
                '¿Estás seguro de que deseas eliminar esta categoría?\n\n' +
                'Esta acción no se puede deshacer.'
            );

            if (!confirmacion) return;
        }

        // Eliminar la categoría
        await CategoriasPlatosAPI.eliminar(id);

        const mensaje = platosAfectados.length > 0
            ? `✅ Categoría eliminada y ${platosAfectados.length} plato(s) reasignado(s) exitosamente`
            : '✅ Categoría eliminada exitosamente';

        alert(mensaje);

        // Recargar las listas
        mostrarListaCategoriasPlatoss();
        if (platosAfectados.length > 0) {
            mostrarListaPlatos();
        }

    } catch (error) {
        console.error('Error al eliminar categoría de plato:', error);
        alert('❌ Error al eliminar la categoría: ' + error.message);
    }
}

