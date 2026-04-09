/**
 * 地図スタイル定数
 * useMap.ts から分離して一元管理する
 */

// 都道府県レイヤー
export const PREFECTURE_BORDER_COLOR = '#C71585';
export const PREFECTURE_FILL_COLOR = 'rgba(255, 182, 193, 0.5)';

// 駅レイヤー
export const STATION_COLOR = '#ffffff';
export const STATION_OUTLINE_COLOR = '#888888';
export const CORRECT_COLOR = '#00C853';
export const WRONG_COLOR = '#F44336';

// 線幅
export const RAILROAD_WIDTH = 2;
export const STATION_WIDTH = 6;
export const STATION_OUTLINE_WIDTH = STATION_WIDTH + 3;

// OSM背景
export const OSM_OPACITY = 0.5;
