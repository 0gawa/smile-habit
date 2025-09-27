import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/AuthContext';

import SplashScreen from './src/SplashScreen';
import AuthScreen from './src/AuthScreen';
import CameraScreen from './src/CameraScreen';
import ResultScreen from './src/ResultScreen';
import MyPageScreen from './src/MyPageScreen';
import SmileLogDetailScreen from './src/SmileLogDetailScreen';

export type RootStackParamList = {
  Auth: undefined;
  MyPage: undefined;
  Camera: undefined;
  Result: { result: any };
  SmileLogDetail: { smileLogId: number }
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator>
      {isLoggedIn ? (
        <>
          <Stack.Screen name="MyPage" component={MyPageScreen} options={{ title: 'マイページ' }} />
          <Stack.Screen name="Camera" component={CameraScreen} options={{ title: '今日の笑顔' }} />
          <Stack.Screen name="Result" component={ResultScreen} options={{ title: '分析結果' }} />
          <Stack.Screen name="SmileLogDetail" component={SmileLogDetailScreen} options={{ title: '思い出' }} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
};

function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

export default App;
