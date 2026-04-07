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

// 東京都庁の座標
const TOKYO_LON = 139.6922;
const TOKYO_LAT = 35.6896;
const INITIAL_ZOOM = 12;

// スタイル定数
const PREFECTURE_BORDER_COLOR = '#C71585';
const PREFECTURE_FILL_COLOR = 'rgba(255, 182, 193, 0.5)';
const STATION_COLOR = '#ffffff';
const CORRECT_COLOR = '#00C853';
const WRONG_COLOR = '#F44336';
const RAILROAD_WIDTH = 2;
const STATION_WIDTH = 6; // 路線より太い線幅

/** 都道府県スタイル */
const prefectureStyle = new Style({
  fill: new Fill({ color: PREFECTURE_FILL_COLOR }),
  stroke: new Stroke({ color: PREFECTURE_BORDER_COLOR, width: 1.5 }),
});

/** 駅のデフォルトスタイル（路線より太い線） */
const stationDefaultStyle = new Style({
  stroke: new Stroke({ color: STATION_COLOR, width: STATION_WIDTH }),
});

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
  /** 正解駅のfeatureId（確定後に設定） */
  correctFeatureId?: string;
  /** 誤クリック駅のfeatureId一覧 */
  wrongFeatureIds?: string[];
  onStationClick?: (featureId: string) => void;
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
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    if (mapRef.current) return;
    const { mode, baseUrl, stations } = optionsRef.current;

    const layers = [];

    // レベル1・閲覧モード: OSM背景
    if (mode === 'level1' || mode === 'browse') {
      layers.push(
        new TileLayer({
          source: new OSM(),
          opacity: 0.5,
        }),
      );
    }

    // レベル1・2・閲覧モード: 都道府県レイヤー
    if (mode !== 'level3') {
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
              color: getLineColor(props.N02_003 ?? '', props.N02_004 ?? ''),
              width: RAILROAD_WIDTH,
            }),
          });
        },
      }),
    );

    // 全レベル: 駅レイヤー（loadStations()済みのデータからOL Featureを生成）
    // station.geojsonのジオメトリはLineString（駅を表す短い線分）
    const stationFeatures = stations.map((s) => {
      const coords = s.lineCoordinates.map((c) => fromLonLat(c));
      const f = new Feature({
        geometry: new LineString(coords),
        stationName: s.stationName,
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
        const { correctFeatureId: cid, wrongFeatureIds: wids } = optionsRef.current;
        if (fid === cid) return correctStationStyle;
        if (wids?.includes(fid)) return wrongStationStyle;
        return stationDefaultStyle;
      },
    });
    layers.push(stationLayer);
    stationLayerRef.current = stationLayer;

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
    };
    // 初回のみ実行
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 正解・誤答状態が変化したとき駅レイヤーを再描画
  useEffect(() => {
    stationLayerRef.current?.changed();
  }, [options.correctFeatureId, options.wrongFeatureIds]);

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
          if (id !== undefined) {
            onStationClick(String(id));
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
          onHover({
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
            onHover({
              lineName: props.N02_003 ?? '',
              companyName: props.N02_004 ?? '',
              pixel: [e.pixel[0], e.pixel[1]],
            });
            found = true;
            return true;
          }
        });
      }

      if (!found) onHover(null);
    });

    return () => unByKey(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.onHover, options.mode]);

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
