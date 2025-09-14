import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SplashScreen from './src/SplashScreen';
import AuthScreen from './src/AuthScreen';
import CameraScreen from './src/CameraScreen';
import ResultScreen from './src/ResultScreen';

// 画面遷移時に渡すパラメータの型を定義します
export type RootStackParamList = {
  Auth: undefined; // Auth画面はパラメータを受け取りません
  Camera: undefined; // Camera画面もパラメータを受け取りません
  Result: { result: any }; // Result画面は'result'という名前のパラメータを受け取ります
};

// 型定義を使ってナビゲーションスタックを作成します
const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // AsyncStorageから認証情報を安全に読み込みます
        const authHeaders = await AsyncStorage.getItem('@auth_headers');
        // 認証情報が存在すれば、ログイン済みと判断します
        if (authHeaders) {
          setIsLoggedIn(true);
        }
      } catch (e) {
        // 万が一、読み込みに失敗した場合のエラーハンドリング
        console.error('Failed to load auth headers.', e);
      }
      // 全ての準備が完了したので、ローディング状態を解除します
      setIsLoading(false);
    };

    bootstrapAsync();
  }, []); // アプリ起動時の非同期処理

  // useCallbackで関数をメモ化し、不要な再レンダリングを防ぎます
  const handleLoginSuccess = useCallback(() => {
    setIsLoggedIn(true);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  if (!isLoggedIn) {
    return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="Auth"
            options={{ headerShown: false }}
            component={() => <AuthScreen onLoginSuccess={handleLoginSuccess}/>}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <>
          <Stack.Screen
            name="Camera"
            component={CameraScreen}
            options={{ title: '今日の笑顔' }}
          />
          <Stack.Screen
            name="Result"
            component={ResultScreen}
            options={{ title: '分析結果' }}
          />
        </>
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App;
