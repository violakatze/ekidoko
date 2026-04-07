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
  correctFeatureId?: string;
  wrongFeatureIds?: string[];
  onStationClick?: (featureId: string) => void;
};

/**
 * OpenLayersの地図表示コンポーネント
 */
export const MapView = ({
  mode,
  baseUrl,
  stations,
  correctFeatureId,
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
    correctFeatureId,
    wrongFeatureIds,
    onStationClick,
    onHover: mode === 'browse' ? handleHover : undefined,
  });

  // 正解確定時に正解駅へ自動移動
  useEffect(() => {
    if (!correctFeatureId) return;
    const target = stations.find((s) => s.featureId === correctFeatureId);
    if (target) flyToStation(target);
  }, [correctFeatureId, stations, flyToStation]);

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
