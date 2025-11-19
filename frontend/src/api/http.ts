import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'

const baseURL = import.meta.env.VITE_API_URL || '/api'

let authToken: string | null = null

export const setAuthToken = (token: string | null) => {
  authToken = token
}

const http: AxiosInstance = axios.create({
  baseURL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json'
  }
})

http.interceptors.request.use((config: AxiosRequestConfig) => {
  if (authToken) {
    config.headers = {
      ...(config.headers || {}),
      Authorization: `Bearer ${authToken}`
    }
  }
  return config
})

http.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const message =
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      error?.message ||
      '请求失败，请稍后再试'
    const enriched = new Error(message) as Error & { status?: number }
    enriched.status = error?.response?.status
    return Promise.reject(enriched)
  }
)

export default http
