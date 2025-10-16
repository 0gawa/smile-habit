import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from './types';

import HomeStackNavigator from './HomeStackNavigator';
import SettingsStackNavigator from './SettingsStackNavigator';
import FriendsScreen from '../screens/FriendsScreen';
import RankingScreen from '../screens/RankingScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }: { route: RouteProp<MainTabParamList> }) => ({
      tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
        let iconName: keyof typeof Ionicons.glyphMap = 'help-circle';

        if (route.name === 'Home') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Friends') {
          iconName = focused ? 'people' : 'people-outline';
        } else if (route.name === 'Ranking') {
          iconName = focused ? 'trophy' : 'trophy-outline';
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
    <Tab.Screen name="Home" component={HomeStackNavigator} options={{ title: 'ホーム' }} />
    <Tab.Screen name="Ranking" component={RankingScreen} options={{ title: 'ランキング' }} />
    <Tab.Screen name="Friends" component={FriendsScreen} options={{ title: 'フレンド' }} />
    <Tab.Screen name="Settings" component={SettingsStackNavigator} options={{ title: '設定' }} />
  </Tab.Navigator>
);

export default MainTabNavigator;
