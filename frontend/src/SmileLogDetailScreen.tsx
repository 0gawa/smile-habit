import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TextInput, Button, Alert, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import api from './api';
import type { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'SmileLogDetail'>;

interface SmileLogDetail {
  id: number;
  date: string;
  overall_score: number;
  journal_entry: string | null;
  photo_url: string | null;
}

const SmileLogDetailScreen: React.FC<Props> = ({ route }) => {
  const { smileLogId } = route.params;
  const [log, setLog] = useState<SmileLogDetail | null>(null);
  const [journalText, setJournalText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogDetail = async () => {
      try {
        const response = await api.get(`/api/v1/smile_logs/${smileLogId}`);
        setLog(response.data);
        setJournalText(response.data.journal_entry || '');
      } catch (error) {
        Alert.alert('エラー', 'データの取得に失敗しました。');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogDetail();
  }, [smileLogId]);

  const handleSaveJournal = async () => {
    try {
      await api.put(`/api/v1/smile_logs/${smileLogId}`, {
        smile_log: { journal_entry: journalText }
      });
      Alert.alert('成功', 'メモを保存しました。');
    } catch (error) {
      Alert.alert('エラー', '保存に失敗しました。');
    }
  };

  if (isLoading) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" /></View>;
  }

  if (!log) {
    return <View style={styles.centerContainer}><Text>データが見つかりません。</Text></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.dateText}>{log.date}</Text>
        {log.photo_url && (
          <Image source={{ uri: log.photo_url }} style={styles.photo} />
        )}
        <Text style={styles.scoreText}>総合スコア: {log.overall_score}点</Text>
        
        <Text style={styles.journalLabel}>今日のメモ</Text>
        <TextInput
          value={journalText}
          onChangeText={setJournalText}
          placeholder="気分や出来事を記録しましょう"
          multiline
          style={styles.textInput}
        />
        <Button title="メモを保存する" onPress={handleSaveJournal} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 20 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  dateText: { fontSize: 18, color: '#888', textAlign: 'center', marginBottom: 15 },
  photo: { width: '100%', height: 350, borderRadius: 10, marginBottom: 20, backgroundColor: '#eee' },
  scoreText: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  journalLabel: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  textInput: {
    height: 150,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    textAlignVertical: 'top',
    fontSize: 16,
  },
});

export default SmileLogDetailScreen;
