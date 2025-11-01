import { AuthAPI } from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    const selectRol = document.getElementById('seleccionarrol');
    const campoContrasenaAdmin = document.getElementById('campoContrasenaAdmin');
    const inputContrasenaAdmin = document.getElementById('contrasenaAdmin');

    function toggleCampoAdmin() {
        if (selectRol.value === 'administrador') {
            campoContrasenaAdmin.style.display = 'block';
            inputContrasenaAdmin.setAttribute('required', 'required');
        } else {
            campoContrasenaAdmin.style.display = 'none';
            inputContrasenaAdmin.removeAttribute('required');
            inputContrasenaAdmin.value = '';
        }
    }

    selectRol.addEventListener('change', toggleCampoAdmin);

    document.getElementById('formularioLogin').addEventListener('submit', async function(evento) {
        evento.preventDefault();

        const nombre = document.getElementById('nombreUsuario').value;
        const email = document.getElementById('email').value;
        const telefono = document.getElementById('telefono').value;
        const contrasena = document.getElementById('contrasena').value;
        const rol = selectRol.value;
        const contrasenaAdmin = inputContrasenaAdmin.value;
        
        const botonSubmit = this.querySelector('button[type="submit"]');

        const rolBackend = (rol === 'administrador') ? 'admin' : 'user';

        const userData = {
            username: nombre,
            correo: email,
            telefono: telefono,
            password: contrasena,
            role: rolBackend
        };

        if (rol === 'administrador') {
            userData.adminPassword = contrasenaAdmin;
        }

        botonSubmit.disabled = true;
        botonSubmit.textContent = 'CREANDO CUENTA...';

        try {
            const response = await AuthAPI.register(userData);
            alert(`¡Cuenta creada exitosamente para ${response.usuario.username}! Serás redirigido para iniciar sesión.`);
            window.location.href = '../index.html';
        } catch (error) {
            alert(`Error al crear la cuenta: ${error.message}`);
            botonSubmit.disabled = false;
            botonSubmit.textContent = 'CREAR CUENTA';
        }
    });
});