
(function() {
    const tipoUsuario = localStorage.getItem('tipoUsuario');
    const userId = localStorage.getItem('userId');
    const currentPage = window.location.pathname.split('/').pop();

    const isAuthPage = currentPage === 'index.html' || currentPage === 'crear_usuario.html' || currentPage === '';


    if (!userId || !tipoUsuario) {
        if (!isAuthPage) {
            alert('Acceso denegado. Por favor, inicia sesión.');
            window.location.href = window.location.pathname.includes('/html/') ? '../index.html' : 'index.html';
        }
        return;
    }

    if (userId && tipoUsuario && isAuthPage) {
        const redirectTo = tipoUsuario === 'admin' ? 'html/admin_panel.html' : 'html/principal_usar.html';
        window.location.href = redirectTo;
        return;
    }

    const adminPages = ['admin_panel.html', 'gestionar_restaurantes.html'];
    const userPages = ['principal_usar.html', 'detalle_restaurante.html'];

    if (tipoUsuario === 'administrador' && userPages.includes(currentPage)) {
        window.location.href = 'admin_panel.html'; 
        return;
    }

    if (tipoUsuario === 'usuario' && adminPages.includes(currentPage)) {
        alert('Acceso denegado. No tienes permisos para ver esta página.');
        window.location.href = 'principal_usar.html';
        return;
    }
})();