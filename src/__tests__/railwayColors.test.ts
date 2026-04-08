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

  it('東京メトロの路線カラーが正しい（N02_003形式）', () => {
    expect(getLineColor('3号線銀座線', '')).toBe('#FF9500');
    expect(getLineColor('4号線丸ノ内線', '')).toBe('#F62E36');
    expect(getLineColor('4号線丸ノ内線分岐線', '')).toBe('#F62E36');
    expect(getLineColor('5号線東西線', '')).toBe('#009BBF');
  });

  it('都営地下鉄の路線カラーが正しい（N02_003形式）', () => {
    expect(getLineColor('1号線浅草線', '')).toBe('#EF454A');
    expect(getLineColor('6号線三田線', '')).toBe('#0079C2');
    expect(getLineColor('10号線新宿線', '')).toBe('#6CBB5A');
    expect(getLineColor('12号線大江戸線', '')).toBe('#C0267F');
  });

  it('旧キー名はマッチしない', () => {
    expect(getLineColor('銀座線', '')).toBe(DEFAULT_LINE_COLOR);
    expect(getLineColor('丸ノ内線', '')).toBe(DEFAULT_LINE_COLOR);
    expect(getLineColor('都営浅草線', '')).toBe(DEFAULT_LINE_COLOR);
  });

  it('会社名フォールバックが東急・京急・京成で機能する', () => {
    expect(getLineColor('存在しない路線', '東急電鉄')).toBe('#E4002B');
    expect(getLineColor('存在しない路線', '京浜急行電鉄')).toBe('#E60012');
    expect(getLineColor('存在しない路線', '京成電鉄')).toBe('#E74C24');
  });
});
