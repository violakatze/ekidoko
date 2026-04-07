import { describe, it, expect } from 'vitest';

import { getLineColor, DEFAULT_LINE_COLOR } from '../data/railwayColors';

describe('getLineColor', () => {
  it('路線名でカラーを取得できる', () => {
    expect(getLineColor('山手線', '')).toBe('#80C241');
  });

  it('会社名フォールバックでカラーを取得できる', () => {
    // 路線名にマッピングがなく会社名にある場合
    expect(getLineColor('存在しない路線', '東日本旅客鉄道')).toBe('#007AC2');
  });

  it('どちらにもマッピングがない場合はデフォルト色を返す', () => {
    expect(getLineColor('不明路線', '不明会社')).toBe(DEFAULT_LINE_COLOR);
  });

  it('東京メトロの路線カラーが正しい', () => {
    expect(getLineColor('銀座線', '')).toBe('#FF9500');
    expect(getLineColor('丸ノ内線', '')).toBe('#F62E36');
    expect(getLineColor('東西線', '')).toBe('#009BBF');
  });
});
