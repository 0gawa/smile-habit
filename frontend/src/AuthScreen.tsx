import React, { useState } from 'react';
import {
  View,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import api from './api';

// onLoginSuccessという名前の関数をpropsとして受け取ることを型定義します
type AuthScreenProps = {
  onLoginSuccess: () => void;
};

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  // 'signIn' | 'signUp' のモードを管理するstate
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // サインイン処理
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
      Alert.alert('ログイン失敗', 'メールアドレスかパスワードが正しくありません。');
      setIsLoading(false);
    }
  };

  // サインアップ処理
  const handleSignUp = async () => {
    if (!email || !password || !passwordConfirmation) {
      Alert.alert('入力エラー', 'すべての項目を入力してください。');
      return;
    }
    if (password !== passwordConfirmation) {
      Alert.alert('入力エラー', 'パスワードが一致しません。');
      return;
    }
    setIsLoading(true);
    try {
      // バックエンドのユーザー登録APIを呼び出す
      await api.post('/auth', {
        email,
        password,
        password_confirmation: passwordConfirmation,
        // メール認証で必要なURL（Dev ClientではダミーでOK）
        confirm_success_url: 'http://localhost:8081/confirmed',
      });
      // devise_token_authは、登録成功時に自動でログイン状態にしてくれる
      onLoginSuccess();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.errors?.full_messages?.[0] ||
        'ユーザー登録に失敗しました。';
      Alert.alert('登録失敗', errorMessage);
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

      {/* サインアップモードの時だけ、パスワード確認欄を表示 */}
      {mode === 'signUp' && (
        <TextInput
          placeholder="Password Confirmation"
          value={passwordConfirmation}
          onChangeText={setPasswordConfirmation}
          style={styles.input}
          secureTextEntry
        />
      )}

      {isLoading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <Button
          title={mode === 'signIn' ? 'サインイン' : '新規登録'}
          onPress={mode === 'signIn' ? handleSignIn : handleSignUp}
        />
      )}

      <TouchableOpacity
        style={styles.toggleContainer}
        onPress={() => setMode(mode === 'signIn' ? 'signUp' : 'signIn')}
      >
        <Text style={styles.toggleText}>
          {mode === 'signIn'
            ? 'アカウントをお持ちでないですか？ 新規登録'
            : 'すでにアカウントをお持ちですか？ サインイン'}
        </Text>
      </TouchableOpacity>
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
    color: '#333',
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
  loader: {
    marginTop: 10,
    marginBottom: 10,
  },
  toggleContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleText: {
    color: '#007AFF',
    fontSize: 14,
  },
});

export default AuthScreen;
