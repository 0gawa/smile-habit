import React, { useRef, useState, useEffect } from 'react';
import { View, Button, Alert, StyleSheet, Text, Linking, AppState, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import api from '../api/client';
import type { HomeStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'Camera'>;

const CameraScreen: React.FC<Props> = ({ navigation }) => {
  const device = useCameraDevice('front');
  const camera = useRef<Camera>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isFocused = useIsFocused();

  const checkPermission = async () => {
    const status = Camera.getCameraPermissionStatus();
    if (status !== 'granted') {
      const newStatus = await Camera.requestCameraPermission();
      setHasPermission(newStatus === 'granted');
    } else {
      setHasPermission(true);
    }
  };

  useEffect(() => {
    checkPermission();
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkPermission();
      }
    });
    return () => subscription.remove();
  }, []);

  const takePicture = async () => {
    if (camera.current == null || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const photo = await camera.current.takePhoto();

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
    } finally {
      setIsSubmitting(false);
    }
  };

  if (device == null || !isFocused) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!hasPermission) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.permissionText}>カメラの権限がありません。</Text>
        <Button title="設定を開く" onPress={() => Linking.openSettings()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isFocused}
        photo={true}
      />
      <View style={styles.buttonContainer}>
        <Button
          title={isSubmitting ? "分析中..." : "笑顔を撮影"}
          onPress={takePicture}
          disabled={isSubmitting}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#fff',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 30,
    padding: 10,
  },
});

export default CameraScreen;
