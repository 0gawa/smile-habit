import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { commonStyles } from '../styles/common';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<SettingsStackParamList, 'Settings'>;

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={styles.container}>
        <View style={styles.profileSection}>
          <Text style={styles.greeting}>こんにちは、{user?.nickname || 'ゲスト'}さん</Text>
        </View>
        <View style={styles.actionsSection}>
          <Button title="プロフィール編集" onPress={() => navigation.navigate('EditUser')} />
          <View style={{ marginVertical: 10 }} />
          <Button title="ログアウト" onPress={signOut} color="#F44336" />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...commonStyles.container,
    paddingVertical: 20,
  },
  profileSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    color: '#888',
    marginTop: 4,
  },
  actionsSection: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
});

export default SettingsScreen;
