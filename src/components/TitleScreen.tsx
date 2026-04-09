import { useState } from 'react';
import {
  Box, Typography, Button, Paper, Divider, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Link,
} from '@mui/material';
import TrainIcon from '@mui/icons-material/Train';
import MapIcon from '@mui/icons-material/Map';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

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
  const [creditOpen, setCreditOpen] = useState(false);

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
            description="背景地図あり・路線あり"
            score={highScores.level1 > 0 ? highScores.level1 : null}
            onClick={() => onStart('level1')}
          />
          <LevelButton
            label="レベル2"
            description="都道府県あり・路線あり"
            score={highScores.level2 > 0 ? highScores.level2 : null}
            onClick={() => onStart('level2')}
          />
          <LevelButton
            label="レベル3"
            description="路線のみ表示（路線カラーなし）"
            score={highScores.level3 > 0 ? highScores.level3 : null}
            onClick={() => onStart('level3')}
          />

          <Divider sx={{ my: 0.5 }} />

          {/* 閲覧モード：ゲームと視覚的に区別するため別スタイルにする */}
          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            size="large"
            startIcon={<MapIcon />}
            onClick={() => onStart('browse')}
            sx={{ py: 1.5, justifyContent: 'flex-start', px: 3 }}
          >
            <Box textAlign="left">
              <Typography variant="body1" fontWeight="bold" component="span" display="block">
                閲覧モード
              </Typography>
              <Typography variant="caption" color="text.secondary" component="span" display="block">
                出題なし・スコアなし。路線や駅をホバーで確認
              </Typography>
            </Box>
          </Button>
        </Box>

        {/* ハイスコアリセット・データ出典 */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Tooltip title="データ出典">
            <IconButton size="small" color="default" onClick={() => setCreditOpen(true)}>
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="ハイスコアをリセット">
            <IconButton size="small" color="default" onClick={onResetScores}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* データ出典ダイアログ */}
      <Dialog open={creditOpen} onClose={() => setCreditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>データ出典</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" gutterBottom>
            本アプリは以下の国土数値情報を使用しています。
          </Typography>

          <Box component="ul" sx={{ pl: 2, mt: 1, mb: 0 }}>
            <Box component="li" mb={1}>
              <Typography variant="body2">
                「国土数値情報（行政区域データ）」（国土交通省）
              </Typography>
              <Typography variant="body2" color="text.secondary">
                2025年 全国データ
              </Typography>
              <Link
                href="https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03-2025.html"
                target="_blank"
                rel="noopener noreferrer"
                variant="body2"
              >
                https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N03-2025.html
              </Link>
            </Box>
            <Box component="li">
              <Typography variant="body2">
                「国土数値情報（鉄道データ）」（国土交通省）
              </Typography>
              <Typography variant="body2" color="text.secondary">
                2024年 全国データ
              </Typography>
              <Link
                href="https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N02-2024.html"
                target="_blank"
                rel="noopener noreferrer"
                variant="body2"
              >
                https://nlftp.mlit.go.jp/ksj/gml/datalist/KsjTmplt-N02-2024.html
              </Link>
            </Box>
          </Box>

          <Typography variant="caption" color="text.secondary" display="block" mt={2}>
            上記データをもとに加工して作成
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreditOpen(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
