import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SettingsStackParamList } from '../navigation/types';
import type { User } from '../types';

type Props = NativeStackScreenProps<SettingsStackParamList, 'EditUser'>;

const EditUserScreen: React.FC<Props> = ({ navigation }) => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [image, setImage] = useState<string | null>(user?.image_url || null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Pre-fill form with user data from context
    if (user) {
      setName(user.name || '');
      setNickname(user.nickname || '');
      setImage(user.image_url || null);
    }
  }, [user]);

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission required", "You need to allow access to your photos to update your profile picture.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleUpdate = async () => {
    if (!nickname) {
      Alert.alert('Error', 'Nickname cannot be empty.');
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('user[name]', name);
    formData.append('user[nickname]', nickname);

    if (image && image !== user?.image_url) {
      const uriParts = image.split('.');
      const fileType = uriParts[uriParts.length - 1];
      formData.append('user[image]', {
        uri: image,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      } as any);
    }

    try {
      const response = await api.patch('/api/v1/mypage', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUser(response.data.user); // Update user in global context
      Alert.alert('Success', 'Your profile has been updated.');
      navigation.navigate('Home');
    } catch (error: any) {
      const errorMessage = error.response?.data?.errors?.join('\n') || 'An error occurred.';
      Alert.alert('Update Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.imageContainer}>
          <Image source={image ? { uri: image } : require('../assets/default-avatar.png')} style={styles.avatar} />
          <Button title="Change Photo" onPress={handleImagePick} />
        </View>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
        />

        <Text style={styles.label}>Nickname</Text>
        <TextInput
          style={styles.input}
          value={nickname}
          onChangeText={setNickname}
          placeholder="Enter your nickname"
        />

        <View style={styles.buttonContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" />
          ) : (
            <Button title="Update Profile" onPress={handleUpdate} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { padding: 20 },
  imageContainer: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 10, backgroundColor: '#ccc' },
  label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default EditUserScreen;
