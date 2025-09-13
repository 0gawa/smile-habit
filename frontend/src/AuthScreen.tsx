import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text } from 'react-native';
import { isAxiosError } from 'axios';
import api from './api';

type AuthScreenProps = {
  onLoginSuccess: () => void;
};

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('入力エラー', 'メールアドレスとパスワードを入力してください。');
      return;
    }
    setIsLoading(true);
    try {
      await api.post('/auth/sign_in', { email, password });
      onLoginSuccess();
    } catch (error) {
      let errorMessage = '予期せぬエラーが発生しました。';
      if (isAxiosError(error)) {
        if (error.response) {
          // サーバーからのレスポンスがある場合 (401 Unauthorizedなど)
          errorMessage = 'メールアドレスかパスワードが正しくありません。';
        } else if (error.request) {
          // サーバーにリクエストが到達しなかった場合 (ネットワークエラーなど)
          errorMessage = 'ネットワークに接続できませんでした。接続を確認してください。';
        }
      }
      Alert.alert('ログイン失敗', errorMessage);
      console.error(error);
      setIsLoading(false); 
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smile Habit</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button title={isLoading ? "サインイン中..." : "サインイン"} onPress={handleSignIn} disabled={isLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
});

export default AuthScreen;
