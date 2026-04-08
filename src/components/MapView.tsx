import { useEffect, useCallback, useState } from 'react';
import { Box } from '@mui/material';

import type { GameMode, HoverInfo, StationFeature } from '../types';
import { useMap } from '../hooks/useMap';
import { Popup } from './Popup';

import 'ol/ol.css';

type MapViewProps = {
  mode: GameMode;
  baseUrl: string;
  stations: StationFeature[];
  correctStationGroupName?: string;
  wrongFeatureIds?: string[];
  onStationClick?: (featureId: string, stationGroupName: string) => void;
};

/**
 * OpenLayersの地図表示コンポーネント
 */
export const MapView = ({
  mode,
  baseUrl,
  stations,
  correctStationGroupName,
  wrongFeatureIds,
  onStationClick,
}: MapViewProps) => {
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);

  const handleHover = useCallback((info: HoverInfo | null) => {
    setHoverInfo(info);
  }, []);

  const { flyToStation } = useMap('map-container', {
    mode,
    baseUrl,
    stations,
    correctStationGroupName,
    wrongFeatureIds,
    onStationClick,
    onHover: mode === 'browse' ? handleHover : undefined,
  });

  // 正解確定時に正解駅（グループ内の最初の1件）へ自動移動
  useEffect(() => {
    if (!correctStationGroupName) return;
    const target = stations.find((s) => s.stationGroupName === correctStationGroupName);
    if (target) flyToStation(target);
  }, [correctStationGroupName, stations, flyToStation]);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      <Box
        id="map-container"
        sx={{ width: '100%', height: '100%', cursor: mode !== 'browse' ? 'crosshair' : 'default' }}
      />
      {hoverInfo && <Popup info={hoverInfo} />}
    </Box>
  );
};
