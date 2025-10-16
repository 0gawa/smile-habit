import React, { useState, useCallback } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, LocaleConfig, DateData } from 'react-native-calendars';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native'; // 画面フォーカス時に処理を実行するためのフック
import * as ImagePicker from 'expo-image-picker'; // 画像アップロード用のライブラリ
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import type { HomeStackParamList } from '../navigation/types';

LocaleConfig.locales['jp'] = {
  monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  dayNames: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
  dayNamesShort: ['日', '月', '火', '水', '木', '金', '土'],
  today: '今日'
};
LocaleConfig.defaultLocale = 'jp';

type Props = NativeStackScreenProps<HomeStackParamList, 'MyPage'>;

interface SmileLogSummary {
  id: number;
  date: string;
  score: number;
}

// カレンダーに表示するマークの型を定義
type MarkedDates = {
  [date: string]: {
    marked: boolean;
    dotColor: string;
  };
};

const MyPageScreen: React.FC<Props> = ({ navigation }) => {
  const { user, setUser } = useAuth();
  const [smileLogs, setSmileLogs] = useState<SmileLogSummary[]>([]);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedToday, setHasCompletedToday] = useState(false);

  // この画面が表示されるたびに、最新のデータをAPIから取得する
  // これにより、撮影後に戻ってきた時にカレンダーとボタンの状態が正しく更新される
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const response = await api.get('/api/v1/mypage');
          setUser(response.data.user);
          setHasCompletedToday(response.data.has_completed_today);

          const logs: SmileLogSummary[] = response.data.smile_logs;
          setSmileLogs(logs);

          const marks: MarkedDates = {};
          response.data.smile_logs.forEach((log: { date: string; score: number }) => {
            marks[log.date] = { marked: true, dotColor: getScoreColor(log.score) };
          });
          setMarkedDates(marks);

        } catch (error) {
          Alert.alert('エラー', 'データの取得に失敗しました。');
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }, [setUser])
  );
  
  const handleImageUpload = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("権限が必要です", "設定アプリからフォトライブラリへのアクセスを許可してください。");
      return;
    }

    // 画像選択ダイアログを開く
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [1, 1], // 1:1の正方形で切り抜き
      quality: 0.8,   // 品質の圧縮
    });

    if (!result.canceled) {
      Alert.alert(
        "確認",
        "この写真で笑顔を分析しますか？\n（本日の分析回数を1回使用します）",
        [
          { text: "キャンセル", style: "cancel" },
          { text: "はい", onPress: () => analyzeImage(result.assets![0].uri) }
        ]
      );
    }
  };

  const handleDayPress = (day: DateData ) => {
    const logId = smileLogs.find(log => log.date === day.dateString)?.id;
    if (logId) {
      // ログがあれば、IDを渡して詳細画面に遷移
      navigation.navigate('SmileLogDetail', { smileLogId: logId });
    }
  };

  const analyzeImage = async (imageUri: string) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('photo', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'upload.jpg',
      });

      const response = await api.post('/api/v1/smile_logs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigation.navigate('Result', { result: response.data });
    } catch (error: any) {
      console.log(error.response?.data?.errors)
      const errorMessage = error.response?.data?.errors || '分析に失敗しました。';
      Alert.alert('エラー', errorMessage);
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score > 80) return '#4CAF50'; // 良いスコア (緑)
    if (score > 60) return '#FFC107'; // 普通のスコア (黄)
    return '#F44336'; // 低いスコア (赤)
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
          {user?.smile_rank?.image_url && (
            <Image source={{ uri: user.smile_rank.image_url }} style={styles.rankImage} />
          )}
          <Text style={styles.nickname}>{user?.nickname || 'ゲスト'}さん</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>ランク</Text>
              <Text style={styles.statValue}>{user?.smile_rank?.name}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>累計スコア</Text>
              <Text style={styles.statValue}>{user?.total_score}</Text>
            </View>
          </View>
        </View>

        <Calendar
          markedDates={markedDates}
          onDayPress={handleDayPress}
          style={styles.calendar}
        />

        {hasCompletedToday ? (
          <View style={styles.completedContainer}>
            <Text style={styles.completedText}>今日のチャレンジは完了しました！</Text>
          </View>
        ) : (
          <View style={styles.actionContainer}>
            <Button title="笑顔を撮影する" onPress={() => navigation.navigate('Camera')} />
            <View style={{ marginVertical: 5 }} />
            <Button title="写真をアップロードして分析" onPress={handleImageUpload} />
          </View>
        )}
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
  rankImage: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 10,
  },
  calendar: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  actionContainer: {
    marginTop: 'auto',
    paddingTop: 10,
  },
  completedContainer: {
    marginTop: 'auto',
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  completedText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  logoutButton: {
    paddingTop: 10,
  },
});

export default MyPageScreen;
