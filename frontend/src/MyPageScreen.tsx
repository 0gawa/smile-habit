import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from './AuthContext';
import api from './api';
import type { RootStackParamList } from '../App';

LocaleConfig.locales['jp'] = {
  monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  dayNames: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
  dayNamesShort: ['日', '月', '火', '水', '木', '金', '土'],
  today: '今日'
};
LocaleConfig.defaultLocale = 'jp';

type Props = NativeStackScreenProps<RootStackParamList, 'MyPage'>;

// カレンダーに表示するマークの型を定義
type MarkedDates = {
  [date: string]: {
    marked: boolean;
    dotColor: string;
  };
};

const MyPageScreen: React.FC<Props> = ({ navigation }) => {
  const { user, setUser, signOut } = useAuth(); // Contextからユーザー情報とsignOut関数を取得
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [isLoading, setIsLoading] = useState(true);

  // カレンダー用の笑顔ログデータのみ、この画面で取得する
  useEffect(() => {
    const fetchSmileLogs = async () => {
      try {
        const response = await api.get('/api/v1/mypage');
        console.log("マイページのレスポンス", response.data);
        setUser(response.data.user);
        const marks: MarkedDates = {};
        response.data.smile_logs.forEach((log: { date: string; score: number }) => {
          marks[log.date] = { marked: true, dotColor: getScoreColor(log.score) };
        });
        setMarkedDates(marks);
      } catch (error) {
        Alert.alert('エラー', 'カレンダーのデータの取得に失敗しました。');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSmileLogs();
  }, []);

  // スコアに応じてドットの色を変えるヘルパー関数
  const getScoreColor = (score: number) => {
    if (score > 80) return '#4CAF50';
    if (score > 60) return '#FFC107';
    return '#F44336';
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.profileContainer}>
          <Text style={styles.nickname}>{user?.nickname || 'ゲスト'}さん</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>ランク</Text>
              <Text style={styles.statValue}>{user?.smile_rank}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>累計スコア</Text>
              <Text style={styles.statValue}>{user?.total_score}</Text>
            </View>
          </View>
        </View>

        <Calendar
          markedDates={markedDates}
          style={styles.calendar}
        />

        <View style={styles.buttonContainer}>
          <Button title="今日の笑顔を撮影する" onPress={() => navigation.navigate('Camera')} />
        </View>

        <View style={styles.logoutButton}>
          <Button title="ログアウト" onPress={signOut} color="#F44336" />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { flex: 1, padding: 20 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nickname: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statLabel: { fontSize: 14, color: '#888' },
  statValue: { fontSize: 20, fontWeight: '600' },
  calendar: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  buttonContainer: {
    paddingBottom: 10,
  },
  logoutButton: {
    marginTop: 'auto',
  }
});

export default MyPageScreen;
