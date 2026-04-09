import { useEffect, useRef, useCallback } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import { PMTilesVectorSource } from 'ol-pmtiles';
import { fromLonLat } from 'ol/proj';
import { Style, Fill, Stroke } from 'ol/style';
import { LineString } from 'ol/geom';
import Feature from 'ol/Feature';
import { unByKey } from 'ol/Observable';

import type { GameMode, HoverInfo, StationFeature } from '../types';
import { getLineColor } from '../data/railwayColors';
import {
  PREFECTURE_BORDER_COLOR,
  PREFECTURE_FILL_COLOR,
  STATION_COLOR,
  STATION_OUTLINE_COLOR,
  CORRECT_COLOR,
  WRONG_COLOR,
  RAILROAD_WIDTH,
  STATION_WIDTH,
  STATION_OUTLINE_WIDTH,
  OSM_OPACITY,
} from '../constants/mapStyles';

// 東京都庁の座標
const TOKYO_LON = 139.6922;
const TOKYO_LAT = 35.6896;
const INITIAL_ZOOM = 12;

// キーボードナビゲーションのパン量（ピクセル）
const KEYBOARD_PAN_PX = 100;

/** 都道府県スタイル */
const prefectureStyle = new Style({
  fill: new Fill({ color: PREFECTURE_FILL_COLOR }),
  stroke: new Stroke({ color: PREFECTURE_BORDER_COLOR, width: 1.5 }),
});

/** 駅のデフォルトスタイル（縁取り＋白） */
const stationDefaultStyle = [
  new Style({ stroke: new Stroke({ color: STATION_OUTLINE_COLOR, width: STATION_OUTLINE_WIDTH }) }),
  new Style({ stroke: new Stroke({ color: STATION_COLOR, width: STATION_WIDTH }) }),
];

/** 正解駅スタイル */
const correctStationStyle = new Style({
  stroke: new Stroke({ color: CORRECT_COLOR, width: STATION_WIDTH + 2 }),
});

/** 不正解駅スタイル */
const wrongStationStyle = new Style({
  stroke: new Stroke({ color: WRONG_COLOR, width: STATION_WIDTH + 2 }),
});

type MapOptions = {
  mode: GameMode;
  baseUrl: string;
  stations: StationFeature[];
  /** 正解駅のN02_005g（確定後に設定）：同値の駅を全てハイライト */
  correctStationGroupName?: string;
  /** 誤クリック駅のfeatureId一覧 */
  wrongFeatureIds?: string[];
  onStationClick?: (featureId: string, stationGroupName: string) => void;
  onHover?: (info: HoverInfo | null) => void;
};

/**
 * OpenLayersの地図を初期化するカスタムフック
 * @param targetId - 地図をマウントするDOM要素のID
 * @param options - 地図設定オプション
 */
export const useMap = (targetId: string, options: MapOptions) => {
  const mapRef = useRef<Map | null>(null);
  const stationLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const stationSourceRef = useRef<VectorSource | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const hoverDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (mapRef.current) return;
    const { mode, baseUrl, stations } = optionsRef.current;

    const layers = [];

    // レベル1・閲覧モード: OSM背景
    if (mode === 'level1' || mode === 'browse') {
      layers.push(
        new TileLayer({
          source: new OSM(),
          opacity: OSM_OPACITY,
        }),
      );
    }

    // レベル2のみ: 都道府県レイヤー
    if (mode === 'level2') {
      layers.push(
        new VectorTileLayer({
          source: new PMTilesVectorSource({ url: `${baseUrl}data/prefecture.pmtiles` }),
          style: prefectureStyle,
        }),
      );
    }

    // 全レベル: 路線レイヤー（PMTiles）
    layers.push(
      new VectorTileLayer({
        source: new PMTilesVectorSource({ url: `${baseUrl}data/railroad.pmtiles` }),
        style: (feature) => {
          const props = feature.getProperties() as { N02_003?: string; N02_004?: string };
          return new Style({
            stroke: new Stroke({
              color: getLineColor(props.N02_003 ?? '', props.N02_004 ?? '', mode === 'level3'),
              width: RAILROAD_WIDTH,
            }),
          });
        },
      }),
    );

    // 全レベル: 駅レイヤー（loadStations()済みのデータからOL Featureを生成）
    const stationFeatures = stations.map((s) => {
      const coords = s.lineCoordinates.map((c) => fromLonLat(c));
      const f = new Feature({
        geometry: new LineString(coords),
        stationName: s.stationName,
        stationGroupName: s.stationGroupName,
        lineName: s.lineName,
        companyName: s.companyName,
      });
      f.setId(s.featureId);
      return f;
    });

    const stationSource = new VectorSource({ features: stationFeatures });
    const stationLayer = new VectorLayer({
      source: stationSource,
      style: (feature) => {
        const fid = String(feature.getId() ?? '');
        const props = feature.getProperties() as { stationGroupName?: string };
        const { correctStationGroupName: cgn, wrongFeatureIds: wids } = optionsRef.current;
        if (cgn !== undefined && props.stationGroupName === cgn) return correctStationStyle;
        if (wids?.includes(fid)) return wrongStationStyle;
        return stationDefaultStyle;
      },
    });
    layers.push(stationLayer);
    stationLayerRef.current = stationLayer;
    stationSourceRef.current = stationSource;

    const map = new Map({
      target: targetId,
      layers,
      view: new View({
        center: fromLonLat([TOKYO_LON, TOKYO_LAT]),
        zoom: INITIAL_ZOOM,
      }),
    });
    mapRef.current = map;

    return () => {
      map.setTarget(undefined);
      mapRef.current = null;
      stationLayerRef.current = null;
      stationSourceRef.current = null;
    };
    // 初回のみ実行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 正解確定時：同グループの駅フィーチャのみ再描画
  useEffect(() => {
    const source = stationSourceRef.current;
    if (!source) return;
    if (options.correctStationGroupName !== undefined) {
      source.getFeatures().forEach((f) => {
        const props = f.getProperties() as { stationGroupName?: string };
        if (props.stationGroupName === options.correctStationGroupName) f.changed();
      });
    } else {
      // 問題遷移時（undefined にリセット）：全体リフレッシュでハイライト解除
      stationLayerRef.current?.changed();
    }
  }, [options.correctStationGroupName]);

  // 誤答追加時：追加された1フィーチャのみ再描画
  useEffect(() => {
    const source = stationSourceRef.current;
    if (!source) return;
    const ids = options.wrongFeatureIds ?? [];
    if (ids.length > 0) {
      const lastId = ids[ids.length - 1];
      if (lastId) source.getFeatureById(lastId)?.changed();
    } else {
      // 問題遷移時（空配列にリセット）：全体リフレッシュ
      stationLayerRef.current?.changed();
    }
  }, [options.wrongFeatureIds]);

  // クリックイベント登録
  useEffect(() => {
    const map = mapRef.current;
    const { onStationClick } = options;
    if (!map || !onStationClick) return;

    const key = map.on('click', (e) => {
      map.forEachFeatureAtPixel(
        e.pixel,
        (feature) => {
          const id = feature.getId();
          const props = feature.getProperties() as { stationGroupName?: string };
          if (id !== undefined && props.stationGroupName !== undefined) {
            onStationClick(String(id), props.stationGroupName);
            return true;
          }
        },
        { layerFilter: (layer) => layer === stationLayerRef.current },
      );
    });

    return () => unByKey(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.onStationClick]);

  // ホバーイベント登録（閲覧モードのみ）
  useEffect(() => {
    const map = mapRef.current;
    const { onHover, mode } = options;
    if (!map || !onHover || mode !== 'browse') return;

    const key = map.on('pointermove', (e) => {
      // 高頻度イベントをデバウンス（約60fps相当）
      if (hoverDebounceRef.current) clearTimeout(hoverDebounceRef.current);
      hoverDebounceRef.current = setTimeout(() => {
        const currentOnHover = optionsRef.current.onHover;
        if (!currentOnHover) return;

        let found = false;

        // 駅レイヤー優先
        map.forEachFeatureAtPixel(
          e.pixel,
          (feature, layer) => {
            if (layer !== stationLayerRef.current) return;
            const props = feature.getProperties() as {
              stationName?: string;
              lineName?: string;
              companyName?: string;
            };
            currentOnHover({
              stationName: props.stationName,
              lineName: props.lineName ?? '',
              companyName: props.companyName ?? '',
              pixel: [e.pixel[0], e.pixel[1]],
            });
            found = true;
            return true;
          },
        );

        if (!found) {
          // 路線レイヤー
          map.forEachFeatureAtPixel(e.pixel, (feature) => {
            const props = feature.getProperties() as { N02_003?: string; N02_004?: string };
            if (props.N02_003 || props.N02_004) {
              currentOnHover({
                lineName: props.N02_003 ?? '',
                companyName: props.N02_004 ?? '',
                pixel: [e.pixel[0], e.pixel[1]],
              });
              found = true;
              return true;
            }
          });
        }

        if (!found) currentOnHover(null);
      }, 16);
    });

    return () => {
      unByKey(key);
      if (hoverDebounceRef.current) clearTimeout(hoverDebounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.onHover, options.mode]);

  // キーボードナビゲーション（矢印キー: パン、+/-: ズーム）
  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const view = mapRef.current?.getView();
      if (!view) return;

      const resolution = view.getResolution() ?? 1;
      const panDist = KEYBOARD_PAN_PX * resolution;
      const center = view.getCenter();
      if (!center) return;

      switch (e.key) {
        case 'ArrowLeft':
          view.setCenter([center[0] - panDist, center[1]]);
          e.preventDefault();
          break;
        case 'ArrowRight':
          view.setCenter([center[0] + panDist, center[1]]);
          e.preventDefault();
          break;
        case 'ArrowUp':
          view.setCenter([center[0], center[1] + panDist]);
          e.preventDefault();
          break;
        case 'ArrowDown':
          view.setCenter([center[0], center[1] - panDist]);
          e.preventDefault();
          break;
        case '+':
        case '=':
          view.setZoom((view.getZoom() ?? INITIAL_ZOOM) + 1);
          e.preventDefault();
          break;
        case '-':
          view.setZoom((view.getZoom() ?? INITIAL_ZOOM) - 1);
          e.preventDefault();
          break;
        default:
          break;
      }
    };

    el.addEventListener('keydown', handleKeyDown);
    return () => el.removeEventListener('keydown', handleKeyDown);
  }, [targetId]);

  /**
   * 指定した駅に地図をアニメーションで移動する
   */
  const flyToStation = useCallback((station: StationFeature) => {
    const view = mapRef.current?.getView();
    if (!view) return;
    view.animate({
      center: fromLonLat(station.centerCoordinates),
      duration: 500,
    });
  }, []);

  return { flyToStation };
};
