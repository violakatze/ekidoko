import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

import { App } from './App';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1565C0',
    },
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('ルート要素が見つかりません');

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
