import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsStackParamList } from './types';

import SettingsScreen from '../screens/SettingsScreen';
import EditUserScreen from '../screens/EditUserScreen';

const Settings = createNativeStackNavigator<SettingsStackParamList>();

const SettingsStackNavigator = () => (
  <Settings.Navigator>
    <Settings.Screen name="SettingsTop" component={SettingsScreen} options={{ title: '設定' }} />
    <Settings.Screen name="EditUser" component={EditUserScreen} options={{ title: 'プロフィール編集' }} />
  </Settings.Navigator>
);

export default SettingsStackNavigator;
