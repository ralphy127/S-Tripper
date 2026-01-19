const API_BASE_URL = 'http://localhost:8000';

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
    throw new Error(data?.detail || `HTTP ${response.status}`);
  }
  
  return data;
}

export const authAPI = {
  register: async (email, password) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
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

  createTrip: async (name, description) => {
    return apiRequest('/trips/', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  },

  getTrip: async (tripId) => {
    return apiRequest(`/trips/${tripId}`);
  },
};
