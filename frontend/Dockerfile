# DebianベースのNode.jsイメージに変更
FROM node:20.19.4-bookworm-slim

# Debianのパッケージマネージャー(apt)でwatchmanをインストール
RUN apt-get update && apt-get install -y watchman

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

# Metro Bundlerが使用するポートを公開
EXPOSE 8081
