import { Box, Typography, Button, Paper, Divider, IconButton, Tooltip } from '@mui/material';
import TrainIcon from '@mui/icons-material/Train';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import type { GameMode, HighScores } from '../types';

type TitleScreenProps = {
  highScores: HighScores;
  onStart: (mode: GameMode) => void;
  onResetScores: () => void;
};

type LevelButtonProps = {
  label: string;
  description: string;
  score: number | null;
  onClick: () => void;
};

const LevelButton = ({ label, description, score, onClick }: LevelButtonProps) => (
  <Box>
    <Button
      variant="contained"
      fullWidth
      size="large"
      onClick={onClick}
      sx={{ justifyContent: 'flex-start', px: 3, py: 1.5 }}
    >
      <Box textAlign="left" flex={1}>
        <Typography variant="body1" fontWeight="bold">
          {label}
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.85 }}>
          {description}
        </Typography>
      </Box>
      {score !== null && (
        <Typography variant="body2" sx={{ ml: 2, whiteSpace: 'nowrap' }}>
          ベスト {score} / 10
        </Typography>
      )}
    </Button>
  </Box>
);

/**
 * タイトル画面
 */
export const TitleScreen = ({ highScores, onStart, onResetScores }: TitleScreenProps) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      bgcolor="grey.100"
      p={3}
    >
      <Paper elevation={4} sx={{ p: 4, maxWidth: 440, width: '100%' }}>
        {/* タイトル */}
        <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
          <TrainIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h3" fontWeight="bold" color="primary.main">
            駅どこ
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
          出題された駅を地図上で探し当てよう！
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {/* レベル選択ボタン */}
        <Box display="flex" flexDirection="column" gap={1.5}>
          <LevelButton
            label="レベル1"
            description="背景地図あり・都道府県あり・路線あり"
            score={highScores.level1 > 0 ? highScores.level1 : null}
            onClick={() => onStart('level1')}
          />
          <LevelButton
            label="レベル2"
            description="背景地図なし・都道府県あり・路線あり"
            score={highScores.level2 > 0 ? highScores.level2 : null}
            onClick={() => onStart('level2')}
          />
          <LevelButton
            label="レベル3"
            description="路線のみ表示"
            score={highScores.level3 > 0 ? highScores.level3 : null}
            onClick={() => onStart('level3')}
          />

          <Divider sx={{ my: 0.5 }} />

          <Button
            variant="outlined"
            fullWidth
            size="large"
            onClick={() => onStart('browse')}
            sx={{ py: 1.5 }}
          >
            閲覧モード
          </Button>
        </Box>

        {/* ハイスコアリセット */}
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Tooltip title="ハイスコアをリセット">
            <IconButton size="small" color="default" onClick={onResetScores}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>
    </Box>
  );
};
