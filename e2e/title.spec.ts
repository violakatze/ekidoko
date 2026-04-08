import { test, expect } from '@playwright/test';

test.describe('タイトル画面', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('ゲームタイトルが表示される', async ({ page }) => {
    await expect(page.getByText('駅どこ')).toBeVisible();
  });

  test('レベル選択ボタンが表示される', async ({ page }) => {
    await expect(page.getByRole('button', { name: /レベル1/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /レベル2/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /レベル3/ })).toBeVisible();
    await expect(page.getByRole('button', { name: '閲覧モード' })).toBeVisible();
  });

  test('レベル1を選択するとゲーム画面に遷移する', async ({ page }) => {
    // レベルボタンが表示されるまで待つ（＝駅データ読み込み完了）
    await expect(page.getByRole('button', { name: /レベル1/ })).toBeVisible({ timeout: 30000 });
    await page.getByRole('button', { name: /レベル1/ }).click();
    // 地図コンテナが表示されることを確認
    await expect(page.locator('#map-container')).toBeVisible({ timeout: 10000 });
  });
});
