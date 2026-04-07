import type { FeatureCollection, Feature, LineString } from 'geojson';

import type { StationFeature } from '../types';

/** GeoJSONのプロパティ型 */
type StationProperties = {
  N02_005: string; // 駅名
  N02_003: string; // 路線名
  N02_004: string; // 会社名
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
 * station.geojsonを取得してStationFeatureの配列に変換する
 * @param baseUrl - Viteのbaseパス（例: '/ekidoko/'）
 */
export const loadStations = async (baseUrl: string): Promise<StationFeature[]> => {
  const url = `${baseUrl}data/station.geojson`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`station.geojson の取得に失敗しました: ${res.status}`);
  }
  const geojson = (await res.json()) as FeatureCollection<LineString, StationProperties>;

  const features: StationFeature[] = [];
  geojson.features.forEach((f: Feature<LineString, StationProperties>, index: number) => {
    const props = f.properties;
    if (!props) return;
    const stationName = props.N02_005;
    const lineName = props.N02_003;
    const companyName = props.N02_004;
    if (!stationName || !lineName || !companyName) return;

    const rawCoords = f.geometry.coordinates;
    const lineCoordinates = rawCoords.map((c): [number, number] => [c[0]!, c[1]!]);
    const centerCoordinates = calcCenter(rawCoords);

    features.push({
      stationName,
      lineName,
      companyName,
      lineCoordinates,
      centerCoordinates,
      featureId: `station-${index}`,
    });
  });

  return features;
};

/**
 * 配列からランダムにcount個を重複なしで抽出する
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
    // 末尾と交換して選択済みを除外
    copy[idx] = copy[copy.length - 1 - i] as T;
  }
  return result;
};
