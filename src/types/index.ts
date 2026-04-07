/** ゲームのモード */
export type GameMode = 'level1' | 'level2' | 'level3' | 'browse';

/** ゲームで使用する駅情報 */
export type StationFeature = {
  /** 駅名 (N02_005) */
  stationName: string;
  /** 路線名 (N02_003) */
  lineName: string;
  /** 会社名 (N02_004) */
  companyName: string;
  /** LineStringの頂点座標列 [[経度, 緯度], ...] */
  lineCoordinates: [number, number][];
  /** 地図移動用の中心座標 [経度, 緯度] */
  centerCoordinates: [number, number];
  /** フィーチャの一意ID */
  featureId: string;
};

/** 1問の状態 */
export type QuestionState = {
  station: StationFeature;
  /** 残り回答機会（初期値3） */
  remainingAttempts: number;
  /** 回答確定済みか（正解 or 機会消費 or タイムアウト） */
  resolved: boolean;
  /** 正解したか */
  correct: boolean;
  /** 誤クリックした駅IDの一覧 */
  wrongFeatureIds: string[];
};

/** ゲーム全体の状態 */
export type GameState = {
  mode: GameMode;
  questions: QuestionState[];
  currentIndex: number;
  score: number;
};

/** 各レベルのハイスコア */
export type HighScores = {
  level1: number;
  level2: number;
  level3: number;
};

/** 閲覧モードのホバー情報 */
export type HoverInfo = {
  stationName?: string;
  lineName: string;
  companyName: string;
  /** マウス座標（ピクセル） */
  pixel: [number, number];
};
