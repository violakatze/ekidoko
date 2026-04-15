import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// GitHub Pages: VITE_BASE_PATH 未設定 → '/ekidoko/'
// Cloudflare Pages: VITE_BASE_PATH='/' を環境変数に設定
const base = process.env.VITE_BASE_PATH ?? '/ekidoko/';

export default defineConfig({
  base,
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
    },
  },
});
