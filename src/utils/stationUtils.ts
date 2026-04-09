import type { FeatureCollection, Feature, LineString } from 'geojson';

import type { StationFeature } from '../types';

/** GeoJSONのプロパティ型 */
type StationProperties = {
  N02_005: string;  // 駅名
  N02_005g: string; // グループ駅名（正解判定用）
  N02_003: string;  // 路線名
  N02_004: string;  // 会社名
};

/** LineStringの中点座標を計算する */
const calcCenter = (coords: number[][]): [number, number] => {
  const mid = Math.floor(coords.length / 2);
  const a = coords[mid - 1] ?? coords[0];
  const b = coords[mid] ?? coords[0];
  if (!a || !b) return [0, 0];
  return [(a[0]! + b[0]!) / 2, (a[1]! + b[1]!) / 2];
};

/**
 * データが変わらない限り安定したフィーチャIDを生成する
 * 路線名・グループ駅名・先頭座標の組み合わせで一意性を担保する
 */
const makeFeatureId = (
  lineName: string,
  stationGroupName: string,
  lineCoordinates: [number, number][],
): string => {
  const c = lineCoordinates[0];
  if (!c) return `${lineName}|${stationGroupName}`;
  return `${lineName}|${stationGroupName}|${c[0].toFixed(6)}|${c[1].toFixed(6)}`;
};

/**
 * station.geojsonを取得してStationFeatureの配列に変換する
 * 同一セッション内ではsessionStorageにキャッシュして再パースを省略する
 * @param baseUrl - Viteのbaseパス（例: '/ekidoko/'）
 */
export const loadStations = async (baseUrl: string): Promise<StationFeature[]> => {
  const cacheKey = `ekidoko_stations_v1_${baseUrl}`;

  // セッションキャッシュから読む
  try {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached) as StationFeature[];
    }
  } catch {
    // キャッシュ読み取り失敗は無視してフェッチへ進む
  }

  const url = `${baseUrl}data/station.geojson`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`station.geojson の取得に失敗しました: ${res.status}`);
  }
  const geojson = (await res.json()) as FeatureCollection<LineString, StationProperties>;

  const features: StationFeature[] = [];
  geojson.features.forEach((f: Feature<LineString, StationProperties>) => {
    const props = f.properties;
    if (!props) return;
    const stationName = props.N02_005;
    const stationGroupName = props.N02_005g;
    const lineName = props.N02_003;
    const companyName = props.N02_004;
    if (!stationName || !stationGroupName || !lineName || !companyName) return;

    const rawCoords = f.geometry.coordinates;
    const lineCoordinates = rawCoords.map((c): [number, number] => [c[0]!, c[1]!]);
    const centerCoordinates = calcCenter(rawCoords);

    features.push({
      stationName,
      stationGroupName,
      lineName,
      companyName,
      lineCoordinates,
      centerCoordinates,
      featureId: makeFeatureId(lineName, stationGroupName, lineCoordinates),
    });
  });

  // セッションキャッシュに保存
  try {
    sessionStorage.setItem(cacheKey, JSON.stringify(features));
  } catch {
    // ストレージ容量超過などは無視する
  }

  return features;
};

/**
 * 配列からランダムにcount個を重複なしで抽出する（部分Fisher-Yatesシャッフル）
 * @param arr - 抽出元配列
 * @param count - 抽出数
 */
export const sampleWithoutReplacement = <T>(arr: T[], count: number): T[] => {
  const copy = [...arr];
  const result: T[] = [];
  const n = Math.min(count, copy.length);
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * (copy.length - i));
    result.push(copy[idx] as T);
    // 選択済み要素を末尾側に退避して次回の選択対象から除外する
    copy[idx] = copy[copy.length - 1 - i] as T;
  }
  return result;
};
