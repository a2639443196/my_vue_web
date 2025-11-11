// API module for Wellness Hub
// This file exports all API services

// Store token for API requests
let authToken: string | null = null

export const api = {
  // Base API configuration
  baseURL: import.meta.env.VITE_API_URL || '/api',

  // Set authentication token
  setAuthToken(token: string) {
    authToken = token
  },

  // Clear authentication token
  clearAuthToken() {
    authToken = null
  },

  // Generic request method
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }

    // Add auth token if available
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`
    }

    const config: RequestInit = {
      headers,
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  },

  // HTTP methods
  get(endpoint: string) {
    return this.request(endpoint)
  },

  post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  put(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete(endpoint: string) {
    return this.request(endpoint, {
      method: 'DELETE',
    })
  },
}

// Export specific API services
export const userApi = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: any) => api.put('/user/profile', data),
}

export const activityApi = {
  getActivities: () => api.get('/activities'),
  createActivity: (data: any) => api.post('/activities', data),
  updateActivity: (id: string, data: any) => api.put(`/activities/${id}`, data),
  deleteActivity: (id: string) => api.delete(`/activities/${id}`),
}

export const chatApi = {
  getMessages: (roomId: string) => api.get(`/chat/rooms/${roomId}/messages`),
  sendMessage: (roomId: string, message: any) => api.post(`/chat/rooms/${roomId}/messages`, message),
  getRooms: () => api.get('/chat/rooms'),
}