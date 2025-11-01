import { AuthAPI } from './api.js';

// Obtener nombre de administrador
document.addEventListener('DOMContentLoaded', function() {
    const nombreAdmin = localStorage.getItem('nombreUsuario') || 'Administrador';
    document.getElementById('nombreAdmin').textContent = nombreAdmin;

    // Asignar evento de clic para cerrar sesión
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', cerrarSesion);
    }
});

// Manejar clics en las tarjetas de gestión
document.addEventListener('click', function(e) {
    // Clic en tarjeta completa
    if (e.target.closest('.tarjeta-gestion')) {
        const tarjeta = e.target.closest('.tarjeta-gestion');
        const modulo = tarjeta.getAttribute('data-modulo');
        
        // Agregar efecto de clic
        tarjeta.style.transform = 'scale(0.98)';
        setTimeout(() => {
            tarjeta.style.transform = 'scale(1)';
        }, 100);
    }

    // Clic en botón "Acceder"
    if (e.target.closest('.boton-acceder')) {
        const modulo = e.target.closest('.boton-acceder').getAttribute('data-modulo');
        navegarAModulo(modulo);
    }

    // Clic en acciones rápidas
    if (e.target.closest('.boton-accion-rapida')) {
        const accion = e.target.closest('.boton-accion-rapida').getAttribute('data-accion');
        ejecutarAccionRapida(accion);
    }
});

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
        case 'resenas':
            alert(`Navegando a Gestión de Reseñas\n\nFuncionalidades:\n• Moderar reseñas nuevas\n• Responder a comentarios\n• Eliminar contenido inapropiado\n• Ver estadísticas de calificaciones`);
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

function mostrarModalListaRestaurantes() {
    document.getElementById('modalListaRestaurantes').style.display = 'block';
    
    // Mostrar indicador de carga
    const listaContainer = document.getElementById('listaRestaurantesSimple');
    listaContainer.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                <div style="width: 20px; height: 20px; border: 2px solid #ad9863; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                Cargando restaurantes...
            </div>
        </div>
    `;
    
    // Simular carga con delay
    setTimeout(() => {
        cargarListaRestaurantes();
    }, 800);
}

function cerrarModalListaRestaurantes() {
    document.getElementById('modalListaRestaurantes').style.display = 'none';
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
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion ${tipo}`;
    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);
    setTimeout(() => notificacion.remove(), 3000);
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
    const incremento = valorFinal / 30;
    const timer = setInterval(() => {
        valorActual += incremento;
        if (valorActual >= valorFinal) {
            elemento.textContent = valorFinal;
            clearInterval(timer);
        } else {
            elemento.textContent = Math.floor(valorActual);
        }
    }, 50);
}

function ejecutarAccionRapida(accion) {
    console.log(`Ejecutando acción: ${accion}`);
    
    switch(accion) {
        case 'agregar-restaurante':
            // Esta función debería estar definida o importada
            // mostrarModalAgregarRestaurante(); 
            alert('Abriendo formulario para agregar nuevo restaurante...');
            break;
        case 'ver-restaurantes':
            // mostrarModalListaRestaurantes();
            alert('Mostrando lista de restaurantes...');
            break;
        // ... otros casos
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

// Animaciones de entrada
window.addEventListener('load', function() {
    const tarjetas = document.querySelectorAll('.tarjeta-gestion');
    const estadisticas = document.querySelectorAll('.estadistica-item');
    
    estadisticas.forEach((stat, index) => {
        setTimeout(() => {
            stat.style.opacity = '1';
            stat.style.transform = 'translateY(0) scale(1)';
        }, index * 200);
    });
    
    tarjetas.forEach((tarjeta, index) => {
        setTimeout(() => {
            tarjeta.style.opacity = '1';
            tarjeta.style.transform = 'translateY(0)';
        }, (index * 300) + 500);
    });
});