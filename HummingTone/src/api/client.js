import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  getApiBaseUrl, 
  setActiveApiBaseUrl, 
  CANDIDATE_HOSTS, 
  DEV_PORT, 
  DEV_DEVICE_IP 
} from './apiConfig';

const ACTIVE_HOST_STORAGE_KEY = '@hummingtone_active_host_v2';

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

let isDiscovering = false;
let discoveryPromise = null;

/**
 * Ping candidate hosts to find the live backend server
 */
export const discoverWorkingHost = async () => {
  if (isDiscovering && discoveryPromise) {
    return discoveryPromise;
  }

  isDiscovering = true;
  discoveryPromise = (async () => {
    try {
      // 1. Check if we have a previously saved working host in storage
      const savedHost = await AsyncStorage.getItem(ACTIVE_HOST_STORAGE_KEY);
      const hostsToTest = Array.from(new Set([
        savedHost,
        `http://${DEV_DEVICE_IP}:${DEV_PORT}`,
        `http://localhost:${DEV_PORT}`,
        `http://127.0.0.1:${DEV_PORT}`,
        `http://10.0.2.2:${DEV_PORT}`,
        `http://192.168.137.1:${DEV_PORT}`,
        ...CANDIDATE_HOSTS,
      ].filter(Boolean)));

      // 2. Ping hosts to find working host
      const checkHost = async (host) => {
        try {
          const res = await axios.get(`${host}/health`, { timeout: 2500 });
          if (res.status === 200) {
            return host;
          }
        } catch (e) {
          // Try site-content fallback
          try {
            const res2 = await axios.get(`${host}/api/site-content`, { timeout: 2500 });
            if (res2.status === 200) {
              return host;
            }
          } catch (e2) {}
        }
        return null;
      };

      for (const host of hostsToTest) {
        const working = await checkHost(host);
        if (working) {
          setActiveApiBaseUrl(working);
          apiClient.defaults.baseURL = working;
          await AsyncStorage.setItem(ACTIVE_HOST_STORAGE_KEY, working).catch(() => {});
          isDiscovering = false;
          return working;
        }
      }
    } catch (err) {
      console.warn('Host discovery error:', err?.message);
    } finally {
      isDiscovering = false;
    }
    return getApiBaseUrl();
  })();

  return discoveryPromise;
};

// Initial background discovery on startup
if (__DEV__) {
  discoverWorkingHost().catch(() => {});
}

// Request Interceptor: Ensure latest active baseURL is applied
apiClient.interceptors.request.use(
  async (config) => {
    config.baseURL = getApiBaseUrl();
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Auto-discover and retry on Network Errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If network error occurred and we haven't already retried this request
    if (error.request && !error.response && !originalRequest?._retry && __DEV__) {
      originalRequest._retry = true;
      try {
        const newHost = await discoverWorkingHost();
        if (newHost && newHost !== originalRequest.baseURL) {
          originalRequest.baseURL = newHost;
          return apiClient(originalRequest);
        }
      } catch (retryErr) {
        console.warn('Auto-failover retry failed:', retryErr?.message);
      }
    }

    if (error.response) {
      console.warn(`API [${error.response.status}]:`, error.response.data);
    } else if (error.request) {
      console.warn(`API Network Error: Could not reach ${getApiBaseUrl()}${error.config?.url || ''}. Check backend server and DEV_DEVICE_IP.`);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
