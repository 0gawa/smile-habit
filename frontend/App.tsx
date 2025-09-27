import React from 'react';
import { NavigationContainer, RouteProp } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './src/AuthContext';
import { Ionicons } from '@expo/vector-icons';

import SplashScreen from './src/SplashScreen';
import AuthScreen from './src/AuthScreen';
import MyPageScreen from './src/MyPageScreen';
import CameraScreen from './src/CameraScreen';
import ResultScreen from './src/ResultScreen';
import SmileLogDetailScreen from './src/SmileLogDetailScreen';
// import FriendsScreen from './src/FriendsScreen';
import SettingsScreen from './src/SettingsScreen';

export type HomeStackParamList = {
  MyPage: undefined;
  Camera: undefined;
  Result: { result: any };
  SmileLogDetail: { smileLogId: number };
};

export type MainTabParamList = {
  Home: undefined;
  Friends: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined; // Mainはログイン後のタブナビゲーション全体を指します
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const Home = createNativeStackNavigator<HomeStackParamList>();

const HomeStack = () => (
  <Home.Navigator>
    <Home.Screen name="MyPage" component={MyPageScreen} options={{ title: 'マイページ' }} />
    <Home.Screen name="Camera" component={CameraScreen} options={{ title: '今日の笑顔' }} />
    <Home.Screen name="Result" component={ResultScreen} options={{ title: '分析結果' }} />
    <Home.Screen name="SmileLogDetail" component={SmileLogDetailScreen} options={{ title: '思い出' }} />
  </Home.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }: { route: RouteProp<MainTabParamList> }) => ({
      tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
        let iconName: keyof typeof Ionicons.glyphMap = 'help-circle';

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Friends') {
          iconName = focused ? 'people' : 'people-outline';
        } else if (route.name === 'Settings') {
          iconName = focused ? 'settings' : 'settings-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <Tab.Screen name="Home" component={HomeStack} options={{ title: 'ホーム' }} />
    {/* <Tab.Screen name="Friends" component={FriendsScreen} options={{ title: 'フレンド' }} /> */}
    <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: '設定' }} />
  </Tab.Navigator>
);

const RootNavigator = () => {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator>
      {isLoggedIn ? (
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
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
