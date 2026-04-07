import { Paper, Typography } from '@mui/material';

import type { HoverInfo } from '../types';

type PopupProps = {
  info: HoverInfo;
};

/**
 * 閲覧モード用ホバーポップアップ
 */
export const Popup = ({ info }: PopupProps) => {
  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        left: info.pixel[0] + 12,
        top: info.pixel[1] + 12,
        p: 1,
        pointerEvents: 'none',
        zIndex: 1000,
        minWidth: 120,
        maxWidth: 240,
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
