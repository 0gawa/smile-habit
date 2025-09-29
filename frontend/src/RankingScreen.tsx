import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import api from './api';

interface RankingUser {
  rank: number;
  id: number;
  nickname: string;
  total_score: number;
  is_current_user: boolean;
}

const RankingScreen: React.FC = () => {
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchRanking();
    }, [])
  );

  const fetchRanking = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/v1/rankings');
      setRanking(response.data);
    } catch (error) {
      Alert.alert('エラー', 'ランキングの取得に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }: { item: RankingUser }) => (
    <View style={[styles.itemContainer, item.is_current_user && styles.currentUserItem]}>
      <Text style={styles.rank}>{item.rank}</Text>
      <View style={styles.userInfo}>
        <Text style={styles.nickname}>{item.nickname}</Text>
        <Text style={styles.score}>{item.total_score} pts</Text>
      </View>
    </View>
  );

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={ranking}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={<Text style={styles.header}>フレンドランキング</Text>}
        onRefresh={fetchRanking}
        refreshing={isLoading}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentUserItem: {
    backgroundColor: '#E3F2FD', // ログインユーザーをハイライトする色
    borderColor: '#007AFF',
    borderWidth: 1.5,
  },
  rank: {
    fontSize: 20,
    fontWeight: 'bold',
    width: 40,
  },
  userInfo: {
    flex: 1,
  },
  nickname: {
    fontSize: 18,
    fontWeight: '500',
  },
  score: {
    fontSize: 16,
    color: 'gray',
    marginTop: 2,
  },
});

export default RankingScreen;
