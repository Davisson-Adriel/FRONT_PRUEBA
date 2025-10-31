const API_CONFIG = {
    BASE_URL: 'http://localhost:5000',
    HEADERS: {
        'Content-Type': 'application/json'
    }
};

async function fetchAPI(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: API_CONFIG.HEADERS,
            ...options
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('No se puede conectar al servidor. Verifica que el backend esté ejecutándose.');
        }
        throw error;
    }
}

const AuthAPI = {
    register: async function(userData) {
        const payload = { ...userData };
        if (payload.contrasena) {
            payload.password = payload.contrasena;
            delete payload.contrasena;
        }

        return await fetchAPI(`${API_CONFIG.BASE_URL}/auth/register`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }
};

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

        const userData = { username: nombre, correo: email, telefono: telefono, contrasena: contrasena, role: rolBackend };

        if (rol === 'administrador') {
            userData.adminPassword = contrasenaAdmin;
        }

        botonSubmit.disabled = true;
        botonSubmit.textContent = 'CREANDO CUENTA...';

        try {
            const response = await AuthAPI.register(userData);
            alert('¡Cuenta creada exitosamente! Serás redirigido para iniciar sesión.');
            window.location.href = '../index.html';
        } catch (error) {
            alert(`Error al crear la cuenta: ${error.message}`);
            botonSubmit.disabled = false;
            botonSubmit.textContent = 'CREAR CUENTA';
        }
    });
});