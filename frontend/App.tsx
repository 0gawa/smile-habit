import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
// react-native-vision-cameraのカメラ機能とパーミッションリクエスト機能をインポート
import { Camera } from 'react-native-vision-camera';

import AuthScreen from './src/AuthScreen';
import CameraScreen from './src/CameraScreen';
import ResultScreen from './src/ResultScreen';

/**
 * React Navigationの画面スタックと、各画面が受け取るパラメータの型を定義します。
 * - `undefined` は、その画面がパラメータを受け取らないことを意味します。
 * - `Result`画面は、`result`というキーで分析結果オブジェクトを受け取ります。
 */
type RootStackParamList = {
  Auth: undefined;
  Camera: undefined;
  Result: { result: any }; // APIレスポンスの型が固まったら、anyを具体的な型に置き換えるとより安全になります
};

// 型定義を使ってStackNavigatorを作成
const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  // ログイン状態を管理するstate。型を<boolean>で明示的に指定
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    // カメラのパーミッション（利用許可）をリクエストする非同期関数
    const requestCameraPermission = async () => {
      await Camera.requestCameraPermission();
    };

    // AsyncStorageに保存された認証情報をもとにログイン状態をチェックする非同期関数
    const checkLoginStatus = async () => {
      const authHeaders = await AsyncStorage.getItem('@auth_headers');
      // 認証情報が存在すれば、ログイン済みと判断
      if (authHeaders) {
        setIsLoggedIn(true);
      }
    };

    requestCameraPermission();
    checkLoginStatus();
  }, []);

  // AuthScreenから呼び出されるログイン成功時のコールバック関数
  const handleLoginSuccess = (): void => {
    setIsLoggedIn(true);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isLoggedIn ? (
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
        ) : (
          <Stack.Screen name="Auth" options={{ title: 'ログイン' }}>
            {/* AuthScreenコンポーネントに、ナビゲーション用のpropsと
              ログイン成功時に呼び出すための関数(onLoginSuccess)を渡します。
            */}
            {(props) => <AuthScreen {...props} onLoginSuccess={handleLoginSuccess} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
