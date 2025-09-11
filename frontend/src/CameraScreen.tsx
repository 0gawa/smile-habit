import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet, Linking, AppState } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native';
import api from './api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// App.tsxで定義した型をインポート（または再度定義）
type RootStackParamList = {
  Auth: undefined;
  Camera: undefined;
  Result: { result: any };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Camera'>;

const CameraScreen: React.FC<Props> = ({ navigation }) => {
  const device = useCameraDevice('front');
  const camera = useRef<Camera>(null);
  const isFocused = useIsFocused();
  const [hasPermission, setHasPermission] = useState(false);

  // 画面が表示されるたびにカメラの権限を確認
  useEffect(() => {
    const checkPermission = async () => {
      const status = await Camera.getCameraPermissionStatus();
      if (status !== 'granted') {
        const newStatus = await Camera.requestCameraPermission();
        setHasPermission(newStatus === 'granted');
      } else {
        setHasPermission(true);
      }
    };
    checkPermission();

    // アプリがバックグラウンドから復帰した際にも権限を再チェック
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkPermission();
      }
    });
    return () => subscription.remove();
  }, []);

  const takePicture = async () => {
    if (camera.current == null) return;
    try {
      const photo = await camera.current.takePhoto({});
      
      const formData = new FormData();
      formData.append('photo', {
        uri: `file://${photo.path}`,
        type: 'image/jpeg',
        name: 'smile.jpg',
      });
      formData.append('journal_entry', 'React Nativeからのテスト投稿');

      const response = await api.post('/api/v1/smile_logs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigation.navigate('Result', { result: response.data });
    } catch (error) {
      Alert.alert('エラー', '撮影または送信に失敗しました。');
      console.error(error);
    }
  };

  // --- 権限やデバイスの状態に応じて表示を切り替え ---
  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text>カメラの権限がありません。</Text>
        <Button title="設定を開く" onPress={() => Linking.openSettings()} />
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={styles.permissionContainer}>
        <Text>フロントカメラが見つかりません。</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isFocused} // 画面が表示されている時だけカメラを有効化
        photo={true}
      />
      <View style={styles.buttonContainer}>
        <Button title="笑顔を撮影" onPress={takePicture} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    zIndex: 1, // ボタンが必ず手前に表示されるように設定
  },
});

export default CameraScreen;
