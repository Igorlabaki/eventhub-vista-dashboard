import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@EventHub:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Rotas públicas que não precisam de autenticação
const PUBLIC_ROUTES = [
  '/venue/:id/form',
  '/proposal/:id/guest-list',
  '/proposal/:id/worker-list', 
  '/proposal/:id/schedule-list',
  '/proposal/:id/view'
];

// Verifica se a rota atual é pública
function isPublicRoute() {
  const currentPath = window.location.pathname;
  return PUBLIC_ROUTES.some(route => {
    const routePattern = route.replace(/:[^/]+/g, '[^/]+');
    const regex = new RegExp(`^${routePattern}$`);
    return regex.test(currentPath);
  });
}

// Interceptor para tratamento de erros e refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for 401 (não autorizado) e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const session = localStorage.getItem('@EventHub:session');
        if (!session) {
          throw new Error('No session found');
        }

        // Tenta atualizar o token
        const response = await api.get('/auth/refresh');
        const { accessToken } = response.data;
        
        localStorage.setItem('@EventHub:token', accessToken);
        
        // Atualiza o token no header e tenta a requisição novamente
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Se falhar o refresh, limpa os dados e redireciona para o login
        localStorage.removeItem('@EventHub:token');
        localStorage.removeItem('@EventHub:session');
        
        // Só redireciona para login se não for uma rota pública
        if (!isPublicRoute()) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
); 