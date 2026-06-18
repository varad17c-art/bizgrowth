const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

function clearStorageAndNotify() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  window.dispatchEvent(new Event('auth-expired'));
}

function throwError(response, data) {
  const errorMsg = data.message || `Request failed with status ${response.status}`;
  const error = new Error(errorMsg);
  error.status = response.status;
  error.data = data;
  throw error;
}

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  
  // Set headers dynamically. Do not set Content-Type if we are sending FormData
  const isFormData = options.body instanceof FormData;
  
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_URL}${path}`, config);
    
    let data;
    try {
      data = await response.json();
    } catch {
      // Handle cases where the server returns a non-JSON success or error
      data = { success: response.ok, message: 'Response parsing failed' };
    }

    if (!response.ok) {
      // Intercept 401 errors for expired tokens (skip auth/refresh, auth/login, auth/register)
      if (
        response.status === 401 &&
        path !== '/api/auth/refresh' &&
        path !== '/api/auth/login' &&
        path !== '/api/auth/register'
      ) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          clearStorageAndNotify();
          throwError(response, data);
        }

        if (isRefreshing) {
          const newToken = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          // Update Authorization header and retry
          config.headers['Authorization'] = `Bearer ${newToken}`;
          const retryResponse = await fetch(`${API_URL}${path}`, config);
          let retryData;
          try {
            retryData = await retryResponse.json();
          } catch {
            retryData = { success: retryResponse.ok, message: 'Response parsing failed' };
          }
          if (!retryResponse.ok) {
            throwError(retryResponse, retryData);
          }
          return retryData;
        }

        isRefreshing = true;

        try {
          // Call direct fetch to avoid interceptor infinite loop
          const refreshResponse = await fetch(`${API_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (!refreshResponse.ok) {
            throw new Error('Refresh token request failed');
          }

          const refreshData = await refreshResponse.json();

          if (refreshData && refreshData.accessToken) {
            localStorage.setItem('token', refreshData.accessToken);
            localStorage.setItem('refreshToken', refreshData.refreshToken);
            
            isRefreshing = false;
            processQueue(null, refreshData.accessToken);

            // Notify AuthContext with the updated user data
            window.dispatchEvent(new CustomEvent('auth-refreshed', { detail: refreshData.user }));

            // Retry original request
            config.headers['Authorization'] = `Bearer ${refreshData.accessToken}`;
            const retryResponse = await fetch(`${API_URL}${path}`, config);
            let retryData;
            try {
              retryData = await retryResponse.json();
            } catch {
              retryData = { success: retryResponse.ok, message: 'Response parsing failed' };
            }
            if (!retryResponse.ok) {
              throwError(retryResponse, retryData);
            }
            return retryData;
          } else {
            throw new Error('Refresh did not return valid accessToken');
          }
        } catch (err) {
          isRefreshing = false;
          processQueue(err, null);
          clearStorageAndNotify();
          throwError(response, data);
        }
      }

      throwError(response, data);
    }

    return data;
  } catch (error) {
    // Standardize network/fetch errors
    if (!error.status) {
      console.error(`API Network Error for ${path}:`, error);
      throw new Error('Network connection error. Please check if backend is running.', { cause: error });
    }
    throw error;
  }
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body: isFormData(body) ? body : JSON.stringify(body) }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body: isFormData(body) ? body : JSON.stringify(body) }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body: isFormData(body) ? body : JSON.stringify(body) }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};

function isFormData(body) {
  return typeof window !== 'undefined' && body instanceof FormData;
}
