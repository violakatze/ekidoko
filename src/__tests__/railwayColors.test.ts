import { describe, it, expect } from 'vitest';

import { getLineColor, DEFAULT_LINE_COLOR } from '../data/railwayColors';

describe('getLineColor', () => {
  it('会社名と路線名の複合キーでカラーを取得できる', () => {
    expect(getLineColor('山手線', '東日本旅客鉄道')).toBe('#80C241');
    expect(getLineColor('中央線', '東日本旅客鉄道')).toBe('#F15A22');
    expect(getLineColor('総武線', '東日本旅客鉄道')).toBe('#FFD400');
  });

  it('東京地下鉄の路線カラーが正しい', () => {
    expect(getLineColor('3号線銀座線', '東京地下鉄')).toBe('#FF9500');
    expect(getLineColor('4号線丸ノ内線', '東京地下鉄')).toBe('#F62E36');
    expect(getLineColor('4号線丸ノ内線分岐線', '東京地下鉄')).toBe('#F62E36');
    expect(getLineColor('5号線東西線', '東京地下鉄')).toBe('#009BBF');
  });

  it('都営地下鉄の路線カラーが正しい', () => {
    expect(getLineColor('1号線浅草線', '東京都')).toBe('#EF454A');
    expect(getLineColor('6号線三田線', '東京都')).toBe('#0079C2');
    expect(getLineColor('10号線新宿線', '東京都')).toBe('#6CBB5A');
    expect(getLineColor('12号線大江戸線', '東京都')).toBe('#C0267F');
  });

  it('新幹線のカラーが正しい', () => {
    expect(getLineColor('東海道新幹線', '東海旅客鉄道')).toBe('#0072BC');
    expect(getLineColor('山陽新幹線', '西日本旅客鉄道')).toBe('#0072BC');
    expect(getLineColor('東北新幹線', '東日本旅客鉄道')).toBe('#009B53');
    expect(getLineColor('上越新幹線', '東日本旅客鉄道')).toBe('#E5171F');
    expect(getLineColor('北陸新幹線', '東日本旅客鉄道')).toBe('#6E4B9E');
    expect(getLineColor('北陸新幹線', '西日本旅客鉄道')).toBe('#6E4B9E');
    expect(getLineColor('九州新幹線', '九州旅客鉄道')).toBe('#DF0000');
    expect(getLineColor('北海道新幹線', '北海道旅客鉄道')).toBe('#00B4A0');
  });

  it('会社デフォルトカラーにフォールバックする（LINE_COLORSにない路線）', () => {
    // JR東日本のコーポレートカラー
    expect(getLineColor('信越線', '東日本旅客鉄道')).toBe('#378640');
    // 東急電鉄のコーポレートカラー
    expect(getLineColor('東横線', '東急電鉄')).toBe('#E4002B');
    expect(getLineColor('田園都市線', '東急電鉄')).toBe('#E4002B');
    // 京浜急行電鉄のコーポレートカラー
    expect(getLineColor('本線', '京浜急行電鉄')).toBe('#E60012');
    // 近畿日本鉄道のコーポレートカラー
    expect(getLineColor('大阪線', '近畿日本鉄道')).toBe('#003087');
  });

  it('会社名・路線名ともに不明な場合はデフォルト色を返す', () => {
    expect(getLineColor('不明路線', '不明会社')).toBe(DEFAULT_LINE_COLOR);
  });

  it('路線名のみでは一致しない（複合キー必須）', () => {
    expect(getLineColor('山手線', '')).toBe(DEFAULT_LINE_COLOR);
    expect(getLineColor('山手線', '不明会社')).toBe(DEFAULT_LINE_COLOR);
  });
});
