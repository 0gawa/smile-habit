import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeStackParamList } from './types';

import MyPageScreen from '../screens/MyPageScreen';
import CameraScreen from '../screens/CameraScreen';
import ResultScreen from '../screens/ResultScreen';
import SmileLogDetailScreen from '../screens/SmileLogDetailScreen';

const Home = createNativeStackNavigator<HomeStackParamList>();

const HomeStackNavigator = () => (
  <Home.Navigator>
    <Home.Screen name="MyPage" component={MyPageScreen} options={{ title: 'マイページ' }} />
    <Home.Screen name="Camera" component={CameraScreen} options={{ title: '今日の笑顔' }} />
    <Home.Screen name="Result" component={ResultScreen} options={{ title: '分析結果' }} />
    <Home.Screen name="SmileLogDetail" component={SmileLogDetailScreen} options={{ title: '思い出' }} />
  </Home.Navigator>
);

export default HomeStackNavigator;
