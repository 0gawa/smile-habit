import React from 'react';
import { View, Text, Button, StyleSheet, SafeAreaView } from 'react-native';
import { useAuth } from './AuthContext';

const SettingsScreen: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.profileSection}>
          <Text style={styles.greeting}>こんにちは、{user?.nickname || 'ゲスト'}さん</Text>
        </View>
        <View style={styles.actionsSection}>
          {/* 将来的にプロフィール編集画面などへのリンクをここに追加 */}
          <Button title="ログアウト" onPress={signOut} color="#F44336" />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  container: {
    flex: 1,
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
