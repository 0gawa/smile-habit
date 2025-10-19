import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextInput, Button, Alert, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import api from '../api/client';
import type { HomeStackParamList } from '../navigation/types';
import { commonStyles } from '../styles/common';

type Props = NativeStackScreenProps<HomeStackParamList, 'SmileLogDetail'>;

interface SmileLogDetail {
  id: number;
  date: string;
  overall_score: number;
  memo: string | null;
  photo_url: string | null;
}

const SmileLogDetailScreen: React.FC<Props> = ({ route }) => {
  const { smileLogId } = route.params;
  const [log, setLog] = useState<SmileLogDetail | null>(null);
  const [memoText, setMemoText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogDetail = async () => {
      try {
        const response = await api.get(`/api/v1/smile_logs/${smileLogId}`);
        const { journal_entry, ...rest } = response.data;
        const formattedData = { ...rest, memo: journal_entry };
        setLog(formattedData);
        setMemoText(formattedData.memo || '');
      } catch (error) {
        Alert.alert('エラー', 'データの取得に失敗しました。');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogDetail();
  }, [smileLogId]);

  const handleSaveMemo = async () => {
    try {
      await api.put(`/api/v1/smile_logs/${smileLogId}`, {
        smile_log: { journal_entry: memoText }
      });
      Alert.alert('成功', 'メモを保存しました。');
    } catch (error) {
      Alert.alert('エラー', '保存に失敗しました。');
    }
  };

  if (isLoading) {
    return <View style={commonStyles.centerContainer}><ActivityIndicator size="large" color="#0000ff" /></View>;
  }

  if (!log) {
    return <View style={commonStyles.centerContainer}><Text>データが見つかりません。</Text></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.dateText}>{new Date(log.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>

        {log.photo_url ? (
          <Image source={{ uri: log.photo_url }} style={styles.photo} />
        ) : (
          <View style={[styles.photo, styles.photoPlaceholder]}>
            <Text>No Image</Text>
          </View>
        )}

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>総合スコア</Text>
          <Text style={styles.scoreValue}>{log.overall_score}点</Text>
        </View>

        <View style={styles.premiumFeatureTeaser}>
          <Text style={styles.premiumText}>✨ 有料プラン（近日公開予定！）でスコアの詳細な内訳を確認できます。</Text>
        </View>

        <View style={styles.memoContainer}>
          <Text style={styles.memoLabel}>今日のメモ</Text>
          <TextInput
            value={memoText}
            onChangeText={setMemoText}
            placeholder="今日の出来事や感じたことを記録しましょう"
            multiline
            style={styles.textInput}
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveMemo}>
            <Text style={styles.saveButtonText}>メモを保存する</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { ...commonStyles.safeArea, backgroundColor: '#f7f8fa' },
  container: { ...commonStyles.container, padding: 24, paddingBottom: 48 },
  dateText: { fontSize: 18, color: '#666', textAlign: 'center', marginBottom: 20 },
  photo: { width: '100%', height: 350, borderRadius: 16, marginBottom: 24, backgroundColor: '#e9ecef' },
  photoPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  scoreContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  scoreLabel: { fontSize: 16, color: '#555', marginBottom: 8 },
  scoreValue: { fontSize: 36, fontWeight: 'bold', color: '#2c3e50' },
  premiumFeatureTeaser: {
    backgroundColor: '#eef5ff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 24,
    alignItems: 'center',
  },
  premiumText: {
    fontSize: 14,
    color: '#3a539b',
    textAlign: 'center',
  },
  memoContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  memoLabel: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 16 },
  textInput: {
    height: 150,
    backgroundColor: '#f7f8fa',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    textAlignVertical: 'top',
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SmileLogDetailScreen;
