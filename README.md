# 駅どこ

出題された駅を地図上で探し当てるゲームです。

## ゲームルール

- 1ゲームで10問出題
- 駅名・路線名・会社名が提示されるので、地図上でその駅をクリックして回答
- 1問につき3回まで回答可能（3回誤答またはタイムアウトで不正解確定）
- 制限時間は1問60秒
- スコアは正解数（0〜10点）

### 難易度

| レベル | 表示レイヤー |
|--------|------------|
| レベル1 | 背景地図・都道府県境界・路線・駅 |
| レベル2 | 都道府県境界・路線・駅 |
| レベル3 | 路線・駅のみ |
| 閲覧モード | レベル1と同じ（出題なし・ホバーで路線/駅情報を表示） |

ハイスコアはレベルごとにブラウザに保存されます。

## 技術スタック

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [OpenLayers](https://openlayers.org/) — 地図表示
- [ol-pmtiles](https://github.com/mmomtchev/ol-pmtiles) — PMTilesサポート
- [Material UI](https://mui.com/) — UIコンポーネント

## データ出典

- 路線・駅データ: [国土地理院 数値地図（国土基本情報）N02](https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N02-v2_3.html)
- 都道府県行政区域データ: [国土地理院 数値地図（国土基本情報）N03](https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03-2025.html)

## 開発

```bash
# 依存関係のインストール
pnpm install

# 開発サーバー起動
pnpm dev

# ビルド
pnpm build

# ユニットテスト
pnpm test

# E2Eテスト
pnpm test:e2e
```

## デプロイ

```bash
pnpm deploy
```

GitHub Pages (`/ekidoko/`) に公開されます。
