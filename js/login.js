import { AuthAPI } from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('.formulario-login'); // CORRECCIÓN: Buscar por clase en lugar de ID

    if (loginForm) {
        loginForm.addEventListener('submit', async function(evento) {
            evento.preventDefault();

            const correo = document.getElementById('correo').value;
            const password = document.getElementById('contrasena').value;
            const botonSubmit = this.querySelector('button[type="submit"]');

            const credentials = { correo, password };

            botonSubmit.disabled = true;
            botonSubmit.textContent = 'INGRESANDO...';

            try {
                const response = await AuthAPI.login(credentials);
                
                localStorage.setItem('authToken', response.token);
                localStorage.setItem('nombreUsuario', response.username);
                localStorage.setItem('userId', response.numericId); 
                localStorage.setItem('tipoUsuario', response.role);

                alert(`¡Bienvenido, ${response.username}!`);

                // Redirigir según el rol del usuario
                if (response.role === 'admin') {
                    window.location.href = 'html/admin_panel.html';
                } else {
                    window.location.href = 'html/principal_usar.html';
                }

            } catch (error) {
                alert(`Error al iniciar sesión: ${error.message}`);
                botonSubmit.disabled = false;
                botonSubmit.textContent = 'LOGIN';
            }
        });
    }
});