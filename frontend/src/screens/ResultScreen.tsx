import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../navigation/types';
import { commonStyles } from '../styles/common';

type Props = NativeStackScreenProps<HomeStackParamList, 'Result'>;

const ResultScreen: React.FC<Props> = ({ route, navigation }) => {
  // navigation.navigateで渡されたresultパラメータを取得
  const { result } = route.params;

  const handleRetakePress = () => {
    Alert.alert(
      "Premiumプランのご案内",
      "Premiumプランにアップグレードすると、1日に3回まで撮り直しが可能になり、納得のいく最高の笑顔を記録できます！",
      [
        { text: "閉じる", style: "cancel" }
        // 将来的にはここに「プラン詳細を見る」ボタンなどを追加
      ]
    );
  };

  const handleGoBackPress = () => {
    navigation.navigate('MyPage');
  };


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>今日の笑顔スコア</Text>
          <Text style={styles.scoreText}>{result.overall_score}点</Text>
        </View>
        
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackText}>{result.feedback || 'フィードバックはありません。'}</Text>
        </View>

        <View style={styles.actionContainer}>
          <Button title="再撮影（Premium機能）" onPress={handleRetakePress} />
          <View style={styles.spacer} />
          <Button title="マイページに戻る" onPress={handleGoBackPress} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    ...commonStyles.safeArea,
    backgroundColor: '#fff',
  },
  container: {
    ...commonStyles.container,
    justifyContent: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  scoreLabel: {
    fontSize: 18,
    color: '#888',
  },
  scoreText: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 90,
  },
  feedbackContainer: {
    minHeight: 100,
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 20,
  },
  feedbackText: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    color: '#555',
  },
  actionContainer: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
  },
  spacer: {
    height: 10,
  }
});

export default ResultScreen;
