import { NavigatorScreenParams } from '@react-navigation/native';

// ResultScreenに渡すパラメータの型
export type ResultScreenParams = {
  result: any; // APIのレスポンスに応じて、より具体的な型にすることが望ましい
};

// SmileLogDetailScreenに渡すパラメータの型
export type SmileLogDetailScreenParams = {
  smileLogId: number;
};

// ホームタブ内のスタックナビゲーションの画面リスト
export type HomeStackParamList = {
  MyPage: undefined;
  Camera: undefined;
  Result: ResultScreenParams;
  SmileLogDetail: SmileLogDetailScreenParams;
};

// 設定タブ内のスタックナビゲーションの画面リスト
export type SettingsStackParamList = {
  Settings: undefined;
  EditUser: undefined;
};

// メインのボトムタブナビゲーションの画面リスト
export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>; // HomeタブはHomeStackを持つ
  Ranking: undefined;
  Friends: undefined;
  Settings: NavigatorScreenParams<SettingsStackParamList>; // SettingsタブはSettingsStackを持つ
};

// アプリ全体のルートスタックナビゲーションの画面リスト
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList>; // Mainはログイン後のタブナビゲーション全体を指す
};
