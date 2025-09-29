# Smile Habit

AIによる表情解析で日々の「笑顔」をスコア化し、ポジティブな毎日を創造するゲーミフィケーション型・ウェルネスアプリです。

## 概要 (About This Project)

`Smile Habit`は、1日1回、笑顔の写真を撮るというシンプルな習慣を通じて、ユーザーの自己肯定感を高めることを目的としたモバイルアプリケーションです。

私たちのコンセプトは、「**表情が心をつくる。科学で笑顔を習慣に。**」です。
脳科学における「表情フィードバック仮説」に基づき、意識的に笑顔を作るトレーニングを提供します。このアプリは、日々のトレーニングがユーザーのメンタルヘルスを向上させ、より幸福な人生を送るための一助となることを目指しています。

## 主な機能 (Key Features)

* **デイリー・スマイルチャレンジ**: 1日1回、あなたの笑顔を撮影し、その日のコンディションを記録します。
* **AIによる表情分析**: `Google Cloud Vision API` を活用し、あなたの笑顔の素晴らしさを多角的な要素から総合的に分析してスコアを算出します。
* **スマイル・ジャーナル**: 過去の記録をカレンダー形式で振り返り、その日の気分や出来事を簡単なメモとして追加できます。
* **フレンド機能**: 友達と繋がり、お互いの成長を励みにモチベーションを維持できます。
* **ランクシステム**: 笑顔の記録を続けることでスコアが貯まり、あなたの「スマイルランク」が昇格していきます。

## 今後の展望：Premiumプラン
今後、より詳細な分析レポートや、納得のいく最高の笑顔を記録できる撮り直し機能、1ヶ月間の表情の変化をまとめた**「成長タイムラプス動画」**の自動生成といった、笑顔をさらに極めるための高度な機能を搭載した**Premiumプラン**の導入を予定しています。

## 使用技術 (Tech Stack)

このプロジェクトは、モダンな技術スタックで構築されています。

#### バックエンド
* **フレームワーク**: Ruby on Rails 8 (API Mode)
* **データベース**: PostgreSQL
* **テスト**: RSpec
* **認証**: devise_token_auth
* **インフラ**: Docker, Docker Compose

#### フロントエンド
* **フレームワーク**: React Native (Expo Dev Client)
* **言語**: TypeScript
* **APIクライアント**: Axios
* **状態管理**: React Context API
* **ナビゲーション**: React Navigation

#### 外部API & CI/CD
* **AI分析**: Google Cloud Vision API
* **CI/CD**: GitHub Actions

## 環境構築 (Getting Started)

### 1. バックエンド
```bash
# 必要なDockerイメージをビルドし、コンテナをバックグラウンドで起動
docker-compose up -d --build

# データベースの作成とマイグレーション
docker-compose exec backend rails db:create
docker-compose exec backend rails db:migrate

# テストデータの投入
docker-compose exec backend rails db:seed
```

### 2. フロントエンド
```bash
# frontendディレクトリに移動
cd frontend

# 依存関係をインストール
yarn install

# iOSネイティブの依存関係をインストール
cd ios && pod install && cd ..

# 開発用クライアントをビルドして実機にインストール
npx expo run:ios --device "あなたのiPhone名"

# 開発サーバーを起動
npx expo start --dev-client --tunnel
```
