import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, useColorScheme, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../api/client';

interface RankingUser {
  rank: number;
  id: number;
  nickname: string;
  total_score: number;
  is_current_user: boolean;
  smile_rank: {
    name: string;
    image_url: string | null;
  };
}

type RankingType = 'friends' | 'monthly' | 'all_time';

const RankingScreen: React.FC = () => {
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<RankingType>('friends');
  const colorScheme = useColorScheme();

  useEffect(() => {
    fetchRanking(activeTab);
  }, [activeTab]);

  const fetchRanking = async (type: RankingType) => {
    try {
      setIsLoading(true);
      const response = await api.get(`/api/v1/rankings?type=${type}`);
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
      {item.smile_rank.image_url && (
        <Image source={{ uri: item.smile_rank.image_url }} style={styles.rankIcon} />
      )}
      <View style={styles.userInfo}>
        <Text style={styles.nickname}>{item.nickname}</Text>
        <Text style={styles.score}>{item.total_score} pts</Text>
      </View>
    </View>
  );

  const TabButton = ({ type, title }: { type: RankingType, title: string }) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === type && styles.activeTabButton]}
      onPress={() => setActiveTab(type)}
    >
      <Text style={[styles.tabButtonText, activeTab === type && styles.activeTabButtonText]}>{title}</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ランキング</Text>
      </View>
      <View style={styles.tabContainer}>
        <TabButton type="friends" title="フレンド" />
        <TabButton type="monthly" title="月間" />
        <TabButton type="all_time" title="総合" />
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <FlatList
          data={ranking}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          onRefresh={() => fetchRanking(activeTab)}
          refreshing={isLoading}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  activeTabButton: {
    backgroundColor: '#007AFF',
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  activeTabButtonText: {
    color: '#fff',
  },
  loader: { marginTop: 20 },
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
  rankIcon: { width: 40, height: 40, marginRight: 10 },
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
