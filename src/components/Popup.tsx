import { Paper, Typography } from '@mui/material';

import type { HoverInfo } from '../types';

type PopupProps = {
  info: HoverInfo;
};

// ポップアップのおおよそのサイズ（ビューポートクランプ用）
const POPUP_WIDTH = 240;
const POPUP_HEIGHT = 72;
const OFFSET = 12;

/**
 * 閲覧モード用ホバーポップアップ
 * ビューポート端でははみ出さないようにクランプする
 */
export const Popup = ({ info }: PopupProps) => {
  const left = Math.min(
    info.pixel[0] + OFFSET,
    window.innerWidth - POPUP_WIDTH - OFFSET,
  );
  const top = Math.min(
    info.pixel[1] + OFFSET,
    window.innerHeight - POPUP_HEIGHT - OFFSET,
  );

  return (
    <Paper
      elevation={3}
      role="tooltip"
      sx={{
        position: 'fixed',
        left,
        top,
        p: 1,
        pointerEvents: 'none',
        zIndex: 1000,
        minWidth: 120,
        maxWidth: POPUP_WIDTH,
      }}
    >
      {info.stationName && (
        <Typography variant="body2" fontWeight="bold">
          {info.stationName}
        </Typography>
      )}
      <Typography variant="caption" display="block">
        {info.lineName}
      </Typography>
      <Typography variant="caption" display="block" color="text.secondary">
        {info.companyName}
      </Typography>
    </Paper>
  );
};
