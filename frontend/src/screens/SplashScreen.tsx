import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { commonStyles } from '../styles/common';

const SplashScreen: React.FC = () => {
  return (
    <View style={commonStyles.centerContainer}>
      <Text style={styles.title}>Smile Habit</Text>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default SplashScreen;
