import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.0.116:3000';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.response.use(async (response) => 
  {
    if (response.headers['access-token']) {
      const authHeaders = {
        'access-token': response.headers['access-token'],
        client: response.headers['client'],
        uid: response.headers['uid'],
        expiry: response.headers['expiry'],
        'token-type': response.headers['token-type'],
      };
        
      // axiosインスタンスのデフォルトヘッダーを即時更新（短期的な記憶）
      api.defaults.headers.common['access-token'] = authHeaders['access-token'];
      api.defaults.headers.common['client'] = authHeaders.client;
      api.defaults.headers.common['uid'] = authHeaders.uid;

      // AsyncStorageに保存（長期的な記憶）
      await AsyncStorage.setItem('@auth_headers', JSON.stringify(authHeaders));
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.request.use(async (config) => {
  const authHeadersString = await AsyncStorage.getItem('@auth_headers');

  if (authHeadersString) {
    const authHeaders = JSON.parse(authHeadersString);
    config.headers['access-token'] = authHeaders['access-token'];
    config.headers['client'] = authHeaders.client;
    config.headers['uid'] = authHeaders.uid;
  }
  return config;
});

export default api;
