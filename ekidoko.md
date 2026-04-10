# 駅どこ 仕様
## 概要
* ゲームタイトルは「駅どこ」(ekidoko)
* CPUが駅名をランダムに選んで出題し、プレイヤーが地図からその駅を選択するゲーム

## 技術スタック
* React + TypeScript
* Vite
* 地図表示にはOpenLayersを使う
* UIコンポーネントとしてMaterialUIを使う
* パッケージマネージャーはpnpm
* GitHub Pagesに公開する

## 使用するデータ
* 以下は事前に用意されているものとする
  * 都道府県行政区域データ(形式:pmtiles, ファイル名:prefecture.pmtiles)
    * 日本の行政区域のデータ
    * 出典は国土地理院データ https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03-2025.html をpmtiles形式に変換したデータ
  * 路線データ(形式:pmtiles, ファイル名:railroad.pmtiles)
    * 日本全国の鉄道路線データ
    * 出典は国土地理院データ https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N02-v2_3.html をpmtiles形式に変換したデータ
  * 駅データ(形式:GeoJSON, ファイル名:station.geojson)
    * 日本全国の駅データ
    * 出典は国土地理院データ https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N02-v2_3.html をpmtiles形式に変換したデータ
    * 問題として利用するため、テキスト形式であるGeoJSONで提供。GitHub Pagesのファイルサイズ的には問題ない(はず)

## ゲームルール
* 難易度別にレベル1～レベル3を用意、それとは別に閲覧モードを用意
* 1ゲームで出題は10問。1問につき2回まで間違いOK
* 駅をクリックすることで回答とする
* 1問の回答の制限時間は60秒
* 駅データからランダムで出題する
  * 1ゲーム内では同じ駅を出題しないこと
* 出題時にプレイヤーに提示する内容は以下
  * 駅名
  * (上記の駅の)路線名
  * (上記の駅の)鉄道会社名
* レベル1の独自ルールは以下
  * 一番下のレイヤーに背景地図(OpenStreetMap)
  * その上のレイヤーに路線データを表示
  * その上のレイヤーに駅データ
* レベル2の独自ルールは以下
  * 一番下のレイヤーに都道府県行政区域データを表示
  * その上のレイヤーに路線データを表示
  * その上のレイヤーに駅データ
* レベル3の独自ルールは以下
  * 一番下のレイヤーに路線データを表示(路線はモノクロ表示)
  * その上のレイヤーに駅データ
* 閲覧モードの独自ルールは以下
  * 問題の出題はしない
  * 地図表示はレベル1と同じ内容
  * マウスポインタを路線または駅に置いた場合、その情報を表示する
* ハイスコアはレベルごとにlocalStrageに保存
* localStrageに保存されたハイスコアを消去する機能を持たせる

## 地図表示について
* マウスホイールにより地図の拡大縮小を可能とする
* 背景地図を表示する場合のopacityは0.5
* 都道府県行政区域データを表示する場合
  * 境界線の表示色は濃いピンク
  * 面の表示色は薄いピンクで、opacityは0.5
* 路線の表示色は以下とする
  * 各地下鉄、東京都営の路線は路線のイメージカラー
  * 首都圏のJR各線は路線のイメージカラー
  * 各新幹線は路線のイメージカラー
  * それ以外は企業のコーポレートカラー
* 駅を表示する場合
  * 路線より線を太く表示する
  * 色は一律で白地に濃いグレー '#888888' で縁取り

## 画面構成
* タイトル画面
  * ゲームタイトルを表示
  * レベル、または閲覧モードを選択してゲームを開始する(地図画面に遷移する)
  * 各レベルごとのハイスコアを表示する
* 地図画面(ゲーム画面)
  * 初期表示位置は東京都庁、zoomは12

---

## TypeScriptコーディング規約

### 型の厳格さ
- `strict: true` を有効にする
- `any` 型は禁止。代わりに `unknown` を使用する

### 型定義
- `interface` より `type` を優先する

### 命名規則

| 対象 | 規則 | 例 |
|------|------|----|
| 変数・関数名 | camelCase | `railwayLayer`, `handleClick` |
| コンポーネント名・型名 | PascalCase | `MapView`, `PopupProps` |
| コンポーネントファイル | PascalCase.tsx | `MapView.tsx` |
| その他ファイル | camelCase.ts | `useMap.ts` |

### import
- パスエイリアス（`@/...`）は使用しない。相対パスで記述する
- import順: 外部ライブラリ → 内部モジュール（空行で区切る）

```ts
// 外部ライブラリ
import Map from 'ol/Map';
import { Box } from '@mui/material';

// 内部モジュール
import { Popup } from './Popup';
import { useMap } from '../hooks/useMap';
```

### コメント
- コメントは日本語で記述する
- 公開APIにはJSDocコメントを付ける

```ts
/**
 * OpenLayersの地図を初期化するカスタムフック
 * @param target - 地図をマウントするDOM要素のID
 */
export const useMap = (target: string) => { ... };
```

### export
- named export を使用する（`export default` は使わない）

```ts
// 良い
export const MapView = () => { ... };

// 悪い
export default MapView;
```

### Linter / Formatter
- ESLint + Prettier を使用する
- 特別なルールの追加なし（標準設定に従う）

---

## テスト方針

### テストの種類

| 種類 | ツール | 対象 |
|------|--------|------|
| ユニットテスト | Vitest | フック・ユーティリティ関数・ロジック |
| E2Eテスト | Playwright | ブラウザ上での地図操作・ポップアップ表示など |

### テストファイルの配置
- ユニットテスト: `src/__tests__/` 以下にまとめる
- E2Eテスト: `e2e/` ディレクトリにまとめる

### カバレッジ
- Vitestのカバレッジ機能（`@vitest/coverage-v8`）で計測する
- 目標カバレッジ率の指定なし

### CI（GitHub Actions）
- `main` ブランチへのPush時にユニットテスト・E2Eテストを自動実行する
- ワークフローファイル: `.github/workflows/test.yml`

---

## GitHub Pagesへの公開手順

1. `vite.config.ts` に `base: '/ekidoko/'` を設定
2. `gh-pages` パッケージを使用
3. `pnpm run deploy` でデプロイ

```ts
// vite.config.ts
export default defineConfig({
  base: '/ekidoko/',
  // ...
})
```
