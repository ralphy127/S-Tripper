const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  
  const data = await response.json().catch(() => null);
  
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    if (data?.detail) {
      if (typeof data.detail === 'string') {
        errorMessage = data.detail;
      } else if (Array.isArray(data.detail)) {
        errorMessage = data.detail.map(e => e.msg).join(', ');
      }
    }
    throw new Error(errorMessage);
  }
  
  return data;
}

export const authAPI = {
  register: async (email, nickname, password) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, nickname, password }),
    });
  },

  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },

  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },
};

export const tripAPI = {
  getTrips: async () => {
    return apiRequest('/trips/');
  },

  createTrip: async (name, description, budget) => {
    return apiRequest('/trips/', {
      method: 'POST',
      body: JSON.stringify({ name, description, budget }),
    });
  },

  getTrip: async (tripId) => {
    return apiRequest(`/trips/${tripId}`);
  },

  
  updateTrip: async (tripId, name, description, budget) => {
    return apiRequest(`/trips/${tripId}`, {
      method: 'PUT',
      body: JSON.stringify({ name, description, budget }),
    });
  },

  deleteTrip: async (tripId) => {
    return apiRequest(`/trips/${tripId}`, {
      method: 'DELETE',
    });
  },
  

  addMember: async (tripId, nickname) => {
    return apiRequest(`/trips/${tripId}/members`, {
      method: 'POST',
      body: JSON.stringify({ nickname }),
    });
  },
};