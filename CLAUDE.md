# 駅どこ (ekidoko) — 実装ガイド

## プロジェクト概要

CPUがランダムに駅名を出題し、プレイヤーが地図上でその駅をクリックして回答するゲームアプリ。

---

## 技術スタック

| 項目 | 内容 |
|------|------|
| フレームワーク | React + TypeScript |
| ビルドツール | Vite |
| 地図ライブラリ | OpenLayers |
| PMTilesサポート | ol-pmtiles |
| UIコンポーネント | Material UI (MUI) |
| パッケージマネージャー | pnpm |
| テスト (ユニット) | Vitest + @vitest/coverage-v8 |
| テスト (E2E) | Playwright |
| Linter/Formatter | ESLint + Prettier (標準設定) |
| 公開先 | GitHub Pages |

---

## ディレクトリ構成

```
ekidoko/
├── public/
│   └── data/
│       ├── station.geojson       # 駅データ（GeoJSON）
│       ├── prefecture.pmtiles    # 都道府県行政区域データ
│       └── railroad.pmtiles      # 路線データ
├── src/
│   ├── components/
│   │   ├── TitleScreen.tsx       # タイトル画面
│   │   ├── GameScreen.tsx        # ゲーム画面（地図画面）
│   │   ├── ResultScreen.tsx      # 結果画面
│   │   ├── MapView.tsx           # OpenLayersマップ本体
│   │   ├── QuestionPanel.tsx     # 出題パネル（駅名・路線名・会社名・タイマー）
│   │   └── Popup.tsx             # 閲覧モード用ホバーポップアップ
│   ├── hooks/
│   │   ├── useMap.ts             # OpenLayers地図の初期化・操作
│   │   ├── useGame.ts            # ゲームロジック（出題・回答・スコア管理）
│   │   └── useHighScore.ts       # localStorage ハイスコア管理
│   ├── data/
│   │   └── railwayColors.ts      # 路線カラーマッピング（ハードコード）
│   ├── types/
│   │   └── index.ts              # 共通型定義
│   ├── utils/
│   │   └── stationUtils.ts       # GeoJSON読み込み・駅データ操作ユーティリティ
│   ├── __tests__/                # ユニットテスト
│   └── App.tsx                   # 画面遷移管理
├── e2e/                          # E2Eテスト
├── .github/
│   └── workflows/
│       └── test.yml              # CI設定
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## データファイル仕様

### station.geojson (`public/data/station.geojson`)

- 形式: GeoJSON（FeatureCollection）
- ジオメトリ: Point（各駅の位置座標）
- サイズ: 約3MB
- ゲームロジック（ランダム出題）と地図描画の両方に使用する
- **OpenLayersでVectorLayerとして描画し、同一データをゲームロジックにも使用する**

| プロパティキー | 内容 |
|---------------|------|
| `N02_005` | 駅名 |
| `N02_003` | 路線名 |
| `N02_004` | 会社名 |

### prefecture.pmtiles (`public/data/prefecture.pmtiles`)

- 形式: PMTiles（ベクタータイル）
- 内容: 日本の都道府県行政区域（面・境界線）
- OpenLayersで `ol-pmtiles` を使い VectorTileLayer として描画する

### railroad.pmtiles (`public/data/railroad.pmtiles`)

- 形式: PMTiles（ベクタータイル）
- 内容: 日本全国の鉄道路線（ライン）
- OpenLayersで `ol-pmtiles` を使い VectorTileLayer として描画する

---

## 画面遷移

```
タイトル画面
  └─[レベル/閲覧モード選択]→ ゲーム画面（地図画面）
                                └─[10問終了]→ 結果画面
                                               └─[ボタン押下]→ タイトル画面
```

---

## 画面仕様

### タイトル画面 (`TitleScreen.tsx`)

- ゲームタイトル「駅どこ」を表示
- 以下のボタンを表示してゲームを開始する（押下でゲーム画面へ遷移）
  - レベル1
  - レベル2
  - レベル3
  - 閲覧モード
- 各レベルのハイスコア（正解数 / 10）を表示
- 「ハイスコアをリセット」ボタンを表示し、押下で全レベルのlocalStorageデータを削除する

### ゲーム画面 / 地図画面 (`GameScreen.tsx`)

- 地図（`MapView.tsx`）を表示
- 閲覧モード以外では出題パネル（`QuestionPanel.tsx`）を表示
  - 問題番号（例: 問1/10）
  - 駅名
  - 路線名
  - 会社名
  - 残り時間（カウントダウン、60秒）
  - 残り回答機会（残り○回）
  - 現在スコア（正解数 / 出題済み問題数）
- 閲覧モードでは出題パネルは表示しない

### 結果画面 (`ResultScreen.tsx`)

- スコアを表示（例: 7 / 10）
- ハイスコアを更新した場合はその旨を表示
- 「タイトルに戻る」ボタンでタイトル画面へ遷移

---

## ゲームロジック仕様

### 難易度・モード

| モード | 内容 |
|--------|------|
| レベル1 | OSM背景あり |
| レベル2 | OSM背景なし |
| レベル3 | 都道府県レイヤーなし |
| 閲覧モード | 出題なし、ホバー情報表示 |

### 出題ルール

1. `station.geojson` の全フィーチャをロードし、ゲーム開始時に10駅をランダムサンプリングする（1ゲーム内で重複なし）
2. 各問題で提示する情報: 駅名（`N02_005`）、路線名（`N02_003`）、会社名（`N02_004`）
3. 制限時間: 60秒 / 問

### 回答ルール

- プレイヤーが地図上の駅をクリックして回答する
- 正解: ハイライト表示 → 「次の問題へ」ボタンを表示 → 押下で次の問題へ進む
- 不正解（回答機会が残っている場合）: クリックした駅を赤くハイライト表示、回答機会を1減らす
- 不正解確定（3回目の誤答、または60秒タイムアウト）: 正解駅をハイライト表示 → 「次の問題へ」ボタンを表示 → 押下で次の問題へ進む
- 1問につき回答機会は最大3回（2回まで間違いOK、3回目で確定）

### スコア

- スコア = 正解問題数（0〜10）
- ハイスコアはレベルごとにlocalStorageに保存する
  - キー例: `ekidoko_highscore_level1`, `ekidoko_highscore_level2`, `ekidoko_highscore_level3`
- 閲覧モードはスコア・ハイスコアなし

### 駅クリック検出

- `map.on('click', ...)` で `map.forEachFeatureAtPixel()` を使い、駅フィーチャへのクリックを検出する
- ゲーム中は駅レイヤー（VectorLayer）のフィーチャのみを対象とする

---

## 地図表示仕様

### 初期表示

- 中心位置: 東京都庁（経度 139.6922、緯度 35.6896）
- ズームレベル: 12
- マウスホイールで拡大縮小を可能とする

### レイヤー構成（下から上の順）

| レベル | レイヤー |
|--------|---------|
| レベル1 | OSM背景 → 都道府県 → 路線 → 駅 |
| レベル2 | 都道府県 → 路線 → 駅 |
| レベル3 | 路線 → 駅 |
| 閲覧モード | OSM背景 → 都道府県 → 路線 → 駅 |

### スタイル仕様

**OSM背景**
- opacity: 0.5

**都道府県行政区域レイヤー**
- 境界線: 濃いピンク（`#C71585`）
- 塗りつぶし: 薄いピンク（`#FFB6C1`）、opacity: 0.5

**路線レイヤー**
- 路線カラーは `src/data/railwayColors.ts` にハードコードする
- マッピング対象:
  - 東京都営・各地下鉄の路線（路線のイメージカラー）
  - 首都圏JR各線（路線のイメージカラー）
  - 各新幹線（路線のイメージカラー）
  - 上記以外: 運営会社のコーポレートカラー
- マッピングにない路線はデフォルト色（`#888888`）を使用
- マッピングキーは `N02_003`（路線名）または `N02_004`（会社名）の組み合わせで定義する

**駅レイヤー**
- 色: `#ffffff`（白）、線幅: 6px
- ストロークを路線より太く表示する（路線: 2px、駅: 5px 程度）

**正解ハイライト**
- 正解駅: 緑（`#00C853`）で強調表示

**不正解ハイライト**
- 誤クリックした駅: 赤（`#F44336`）で表示（次の問題に進むまで残す）

---

## 閲覧モード — ホバー表示

- `map.on('pointermove', ...)` でポインタ下のフィーチャを検出する
- 路線（railroad VectorTileLayer）にホバー時: 路線名、会社名を表示
- 駅（station VectorLayer）にホバー時: 駅名、路線名、会社名を表示
- ポップアップは `Popup.tsx` コンポーネントで実装し、マウス位置近傍に表示する

---

## 型定義（`src/types/index.ts`）

```ts
/** ゲームのモード */
type GameMode = 'level1' | 'level2' | 'level3' | 'browse';

/** 駅の情報 */
type StationFeature = {
  stationName: string;  // N02_005
  lineName: string;     // N02_003
  companyName: string;  // N02_004
  coordinates: [number, number]; // [longitude, latitude]
  featureId: string | number;
};

/** 1問の状態 */
type QuestionState = {
  station: StationFeature;
  remainingAttempts: number; // 初期値3
  answered: boolean;
  correct: boolean;
};

/** ゲーム全体の状態 */
type GameState = {
  mode: GameMode;
  questions: QuestionState[];
  currentIndex: number;
  score: number;
};
```

---

## TypeScriptコーディング規約

- `strict: true` を有効にする
- `any` 型は禁止。代わりに `unknown` を使用する
- `interface` より `type` を優先する
- named export を使用する（`export default` は使わない）
- パスエイリアス（`@/...`）は使用しない。相対パスで記述する
- コメントは日本語で記述する
- 公開APIにはJSDocコメントを付ける

### 命名規則

| 対象 | 規則 | 例 |
|------|------|----|
| 変数・関数名 | camelCase | `railwayLayer`, `handleClick` |
| コンポーネント名・型名 | PascalCase | `MapView`, `PopupProps` |
| コンポーネントファイル | PascalCase.tsx | `MapView.tsx` |
| その他ファイル | camelCase.ts | `useMap.ts` |

### import順

```ts
// 外部ライブラリ
import Map from 'ol/Map';
import { Box } from '@mui/material';

// 内部モジュール
import { Popup } from './Popup';
import { useMap } from '../hooks/useMap';
```

---

## テスト方針

| 種類 | ツール | 対象 |
|------|--------|------|
| ユニットテスト | Vitest | フック・ユーティリティ関数・ゲームロジック |
| E2Eテスト | Playwright | ブラウザ上での地図操作・ポップアップ表示など |

- ユニットテスト: `src/__tests__/` 以下
- E2Eテスト: `e2e/` 以下
- カバレッジ: `@vitest/coverage-v8` で計測（目標値の指定なし）

### CI（GitHub Actions）

- `main` ブランチへのPush時にユニットテスト・E2Eテストを自動実行する
- ワークフローファイル: `.github/workflows/test.yml`

---

## GitHub Pagesへのデプロイ

```ts
// vite.config.ts
export default defineConfig({
  base: '/ekidoko/',
  // ...
});
```

- `gh-pages` パッケージを使用
- `pnpm run deploy` でデプロイ
- データファイル（`public/data/`）はViteのビルドで `dist/data/` にコピーされ、GitHub Pages上で `/ekidoko/data/` として配信される
