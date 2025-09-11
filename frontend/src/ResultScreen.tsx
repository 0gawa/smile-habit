import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// App.tsxで定義した型をインポート
type RootStackParamList = {
  Auth: undefined;
  Camera: undefined;
  Result: { result: any };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

const ResultScreen: React.FC<Props> = ({ route, navigation }) => {
  // route.paramsから分析結果を受け取る
  const { result } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.scoreText}>総合スコア: {result.overall_score}点</Text>
      <Text style={styles.feedbackText}>フィードバック: {result.feedback || 'フィードバックはありません'}</Text>
      <Button title="もう一度撮影する" onPress={() => navigation.goBack()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  scoreText: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  feedbackText: { fontSize: 18, textAlign: 'center', marginBottom: 40 },
});

export default ResultScreen;
