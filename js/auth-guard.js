/* Este script debe ser el primero en cargarse en las páginas protegidas */
(function() {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
        alert('Acceso denegado. Por favor, inicia sesión.');
        window.location.href = '../index.html'; 
    }
})();

(function() {
    const tipoUsuario = localStorage.getItem('tipoUsuario');
    const authToken = localStorage.getItem('authToken');
    const currentPage = window.location.pathname.split('/').pop();

    const adminPages = ['admin_panel.html', 'gestionar_restaurantes.html'];
    const userPages = ['principal_usar.html', 'detalle_restaurante.html'];

    if (!authToken || !tipoUsuario) {

        if (currentPage !== 'index.html' && currentPage !== 'crear_usuario.html') {
            alert('Acceso denegado. Por favor, inicia sesión.');
            window.location.href = '../index.html'; 
        }
        return;
    }

    if (tipoUsuario === 'administrador' && userPages.includes(currentPage)) {
        console.log('Redirigiendo administrador al panel principal...');
        window.location.href = 'admin_panel.html'; 
        return;
    }

    if (tipoUsuario === 'usuario' && adminPages.includes(currentPage)) {
        alert('Acceso denegado. No tienes permisos para ver esta página.');
        window.location.href = 'principal_usar.html';
        return;
    }
})();