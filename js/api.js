
const API_CONFIG = {
    BASE_URL: 'http://localhost:5000',
    HEADERS: {
        'Content-Type': 'application/json'
    }
};

export async function fetchAPI(url, options = {}) {
    try {
        console.log('🔄 Petición API:', url);
        const response = await fetch(url, {
            headers: API_CONFIG.HEADERS,
            ...options
        });

        console.log('📡 Respuesta:', response.status, response.statusText);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('📦 Datos recibidos:', data);
        
        if (data && typeof data === 'object' && Array.isArray(data.value)) {
            return data.value;
        }
        
        if (Array.isArray(data)) {
            return data;
        }
        
        return data;
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error('❌ Error de conectividad - Backend no disponible');
            throw new Error('No se puede conectar al servidor. Verifica que el backend esté ejecutándose en http://localhost:5000');
        }
        console.error('❌ Error en petición API:', error);
        throw error;
    }
}

export const RestaurantesAPI = {
    getAll: async function() {
        return await fetchAPI(`${API_CONFIG.BASE_URL}/restaurantes`);
    },

    getById: async function(id) {
        return await fetchAPI(`${API_CONFIG.BASE_URL}/restaurantes/${id}`);
    },

    create: async function(restauranteData) {
        return await fetchAPI(`${API_CONFIG.BASE_URL}/restaurantes`, {
            method: 'POST',
            body: JSON.stringify(restauranteData)
        });
    },

    update: async function(id, restauranteData) {
        return await fetchAPI(`${API_CONFIG.BASE_URL}/restaurantes/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(restauranteData)
        });
    },

    delete: async function(id) {
        return await fetchAPI(`${API_CONFIG.BASE_URL}/restaurantes/${id}`, {
            method: 'DELETE'
        });
    }
};

// API para Platos
export const PlatosAPI = {
    getAll: async function() {
        return await fetchAPI(`${API_CONFIG.BASE_URL}/platos`);
    },

    getById: async function(id) {
        return await fetchAPI(`${API_CONFIG.BASE_URL}/platos/${id}`);
    },

    getByRestaurante: async function(restauranteId) {
        const platos = await fetchAPI(`${API_CONFIG.BASE_URL}/platos`);
        return platos.filter(plato => plato.id_restaurante == restauranteId);
    },

    create: async function(platoData) {
        return await fetchAPI(`${API_CONFIG.BASE_URL}/platos`, {
            method: 'POST',
            body: JSON.stringify(platoData)
        });
    },

    update: async function(id, platoData) {
        return await fetchAPI(`${API_CONFIG.BASE_URL}/platos/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(platoData)
        });
    },

    delete: async function(id) {
        return await fetchAPI(`${API_CONFIG.BASE_URL}/platos/${id}`, {
            method: 'DELETE'
        });
    }
};
    
// API para reseñas de restaurantes
export const ResenasRestaurantesAPI = {
    async obtenerTodas() {
        return await fetchAPI(`${API_CONFIG.BASE_URL}/resenas_restaurantes`);
    },

    async obtenerPorRestaurante(restauranteId) {
        const todasLasResenas = await this.obtenerTodas();
        return todasLasResenas.filter(resena => resena.restauranteId === parseInt(restauranteId));
    },

    async crear(resenaData) {
        return await fetchAPI(`${API_CONFIG.BASE_URL}/resenas_restaurantes`, {
            method: 'POST',
            body: JSON.stringify(resenaData)
        });
    },

    async actualizar(id, resenaData) {
        // Usamos PATCH para actualizaciones parciales
        return await fetchAPI(`${API_CONFIG.BASE_URL}/resenas_restaurantes/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(resenaData)
        });
    },

    async eliminar(id) {
        return await fetchAPI(`${API_CONFIG.BASE_URL}/resenas_restaurantes/${id}`, {
            method: 'DELETE'
        });
    }
};

// API para reseñas de platos
export const ReseñasPlatosAPI = {
    async obtenerTodas() {
        return await fetchAPI(`${API_CONFIG.BASE_URL}/resenas_platos`);
    },

    async obtenerPorPlato(platoId) {
        const todasLasResenas = await this.obtenerTodas();
        return todasLasResenas.filter(resena => resena.platoId === parseInt(platoId));
    },

    async crear(resenaData) {
        return await fetchAPI(`${API_CONFIG.BASE_URL}/resenas_platos`, {
            method: 'POST',
            body: JSON.stringify(resenaData)
        });
    },

    async actualizar(id, resenaData) {
        return await fetchAPI(`${API_CONFIG.BASE_URL}/resenas_platos/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(resenaData)
        });
    },

    async eliminar(id) {
        return await fetchAPI(`${API_CONFIG.BASE_URL}/resenas_platos/${id}`, {
            method: 'DELETE'
        });
    }
};

// API para usuarios
export const UsuariosAPI = {
    async obtenerTodos() {
        return await fetchAPI(`${API_CONFIG.BASE_URL}/usuarios`);
    },

    async obtenerPorId(id) {
        const usuarios = await this.obtenerTodos();
        return usuarios.find(usuario => usuario.id === parseInt(id));
    }
};

export const AuthAPI = {
    register: async function(userData) {
        return await fetchAPI(`${API_CONFIG.BASE_URL}/auth/register`, {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    login: async function(credentials) {
        const payload = { ...credentials };
        return await fetchAPI(`${API_CONFIG.BASE_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }
};
