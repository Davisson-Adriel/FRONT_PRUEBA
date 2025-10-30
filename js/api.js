
const API_CONFIG = {
    BASE_URL: 'http://localhost:5000',
    HEADERS: {
        'Content-Type': 'application/json'
    }
};

async function fetchAPI(url, options = {}) {
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
        
        // El backend puede devolver directamente un array o un objeto con 'value' property
        if (data && typeof data === 'object' && Array.isArray(data.value)) {
            return data.value;
        }
        
        // Si ya es un array, devolverlo directamente
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

const RestaurantesAPI = {
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
const PlatosAPI = {
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
