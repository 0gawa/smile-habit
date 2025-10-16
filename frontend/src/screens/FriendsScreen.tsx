import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../api/client';

interface Friend {
  id: number;
  nickname: string;
  total_score: number;
  smile_rank: string;
}
interface SearchedUser {
  id: number;
  nickname: string;
}

const FriendsScreen: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchFriends();
    }, [])
  );

  const fetchFriends = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/api/v1/friendships');
      setFriends(response.data);
    } catch (error) {
      Alert.alert('エラー', 'フレンドリストの取得に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) {
      Alert.alert('検索エラー', '2文字以上入力してください。');
      return;
    }
    setIsSearching(true);
    setHasSearched(true);
    try {
      const response = await api.get(`/api/v1/users/search?query=${searchQuery}`);
      setSearchResults(response.data);
    } catch (error) {
      Alert.alert('エラー', 'ユーザー検索に失敗しました。');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFriend = async (userToAdd: SearchedUser) => {
    try {
      await api.post('/api/v1/friendships', { followed_id: userToAdd.id });
      Alert.alert('成功', `${userToAdd.nickname}さんをフレンドに追加しました。`);
      setSearchResults(prev => prev.filter(user => user.id !== userToAdd.id));
      fetchFriends();
    } catch (error) {
      Alert.alert('エラー', 'フレンドの追加に失敗しました。');
    }
  };

  const handleRemoveFriend = async (friendToRemove: Friend) => {
    Alert.alert(
      "フレンド解除",
      `${friendToRemove.nickname}さんをフレンドから解除しますか？`,
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "解除する",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/api/v1/friendships/${friendToRemove.id}`);
              fetchFriends();
            } catch (error) {
              Alert.alert('エラー', 'フレンドの解除に失敗しました。');
            }
          }
        }
      ]
    );
  };

  const renderSearchResult = () => {
    if (isSearching) {
      return <ActivityIndicator style={styles.loader} />;
    }
    if (hasSearched && searchResults.length === 0) {
      return <Text style={styles.emptyMessage}>ユーザーが見つかりませんでした。</Text>;
    }
    return (
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text style={styles.nickname}>{item.nickname}</Text>
            <Button title="追加" onPress={() => handleAddFriend(item)} />
          </View>
        )}
        style={styles.searchResultList}
      />
    );
  };

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>フレンドを探す</Text>
        <View style={styles.card}>
          <View style={styles.searchSection}>
            <TextInput
              style={styles.input}
              placeholder="ニックネームで検索"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <Button title={isSearching ? "..." : "検索"} onPress={handleSearch} disabled={isSearching} />
          </View>
          {hasSearched && renderSearchResult()}
        </View>

        <Text style={styles.header}>フレンドリスト</Text>
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.friendItem}>
              <View>
                <Text style={styles.nickname}>{item.nickname}</Text>
                <Text style={styles.friendInfo}>Rank: {item.smile_rank} | Score: {item.total_score}</Text>
              </View>
              <TouchableOpacity onPress={() => handleRemoveFriend(item)}>
                <Ionicons name="person-remove-outline" size={24} color="#F44336" />
              </TouchableOpacity>
            </View>
          )}
          onRefresh={fetchFriends}
          refreshing={isLoading}
          ListEmptyComponent={<Text style={styles.emptyMessage}>まだフレンドがいません。探してみましょう！</Text>}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 22, fontWeight: 'bold', marginTop: 16, marginBottom: 8, paddingHorizontal: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchSection: {
    flexDirection: 'row',
  },
  input: {
    flex: 1,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginRight: 10,
    borderRadius: 8,
    height: 44,
  },
  searchResultList: {
    marginTop: 10,
    maxHeight: 150,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  nickname: {
    fontSize: 18,
    fontWeight: '500',
  },
  friendInfo: {
    fontSize: 14,
    color: 'gray',
    marginTop: 4,
  },
  emptyMessage: {
    textAlign: 'center',
    color: 'gray',
    paddingVertical: 20,
  },
  loader: {
    marginTop: 10,
  },
});

export default FriendsScreen;
