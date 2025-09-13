import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
});

// ---リクエスト前に必ず実行される処理----
api.interceptors.request.use(async (config) => {
  // AsyncStorageから認証情報を取得
  const authHeaders = await AsyncStorage.getItem('@auth_headers');
  if (authHeaders) {
    const { 'access-token': accessToken, client, uid } = JSON.parse(authHeaders);
    // ヘッダーに認証情報を追加
    config.headers['access-token'] = accessToken;
    config.headers['client'] = client;
    config.headers['uid'] = uid;
  }
  return config;
});

// ★★★ レスポンスを受け取った後に必ず実行される処理 ★★★
api.interceptors.response.use(
  (response) => {
    // レスポンスヘッダーに新しい認証情報があれば、AsyncStorageに保存
    if (response.headers['access-token']) {
      const newAuthHeaders = {
        'access-token': response.headers['access-token'],
        client: response.headers['client'],
        uid: response.headers['uid'],
      };
      AsyncStorage.setItem('@auth_headers', JSON.stringify(newAuthHeaders));
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
