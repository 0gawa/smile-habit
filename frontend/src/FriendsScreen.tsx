import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from './api';

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

  // この画面が表示されるたびにフレンドリストを更新
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
      fetchFriends(); // フレンドリストを即時更新
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
              Alert.alert('成功', `${friendToRemove.nickname}さんをフレンドから解除しました。`);
              fetchFriends(); // フレンドリストを即時更新
            } catch (error) {
              Alert.alert('エラー', 'フレンドの解除に失敗しました。');
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.searchSection}>
          <TextInput
            style={styles.input}
            placeholder="ニックネームでユーザーを検索"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <Button title={isSearching ? "検索中..." : "検索"} onPress={handleSearch} disabled={isSearching} />
        </View>

        {searchResults.length > 0 && (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.userItem}>
                <Text>{item.nickname}</Text>
                <Button title="追加" onPress={() => handleAddFriend(item)} />
              </View>
            )}
            style={styles.searchResultList}
          />
        )}
        
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
                <Ionicons name="person-remove-outline" size={24} color="red" />
              </TouchableOpacity>
            </View>
          )}
          onRefresh={fetchFriends}
          refreshing={isLoading}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 22, fontWeight: 'bold', marginTop: 10, marginBottom: 10, paddingHorizontal: 10 },
  searchSection: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', borderRadius: 10 },
  input: { flex: 1, borderColor: '#ddd', borderWidth: 1, paddingHorizontal: 10, marginRight: 10, borderRadius: 5 },
  searchResultList: { maxHeight: 150 },
  userItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  friendItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  nickname: { fontSize: 18, fontWeight: '500' },
  friendInfo: { fontSize: 14, color: 'gray', marginTop: 4 },
});

export default FriendsScreen;
