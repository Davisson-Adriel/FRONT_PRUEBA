(function() {
    const token = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('tipoUsuario');
    const currentPage = window.location.pathname.split('/').pop();

    const adminPages = ['admin_panel.html', 'gestionar_restaurantes.html'];

    // recordatorio: mejorar la condicion a un mas optima
    if (!token) {
        alert('Acceso denegado. Debes iniciar sesión para ver esta página.');
        // Redirige a la página de inicio de sesión. La ruta es relativa.
        window.location.href = '../index.html';
        return;
    }

    if (adminPages.includes(currentPage) && userRole !== 'admin') {
        alert('Acceso denegado. No tienes permisos de administrador para acceder a esta página.');
        window.location.href = 'principal_usar.html';
        return;
    }
})();