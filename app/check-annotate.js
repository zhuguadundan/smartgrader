// 使用 Playwright 访问本地测试页，读取“自动校验结果”
// 需先在 app 目录执行：
//   npm i -D @playwright/test
//   npx playwright install chromium

const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:3000/test/annotate', { waitUntil: 'domcontentloaded', timeout: 30000 });
    // 等待页面初次绘制完成
    await page.waitForTimeout(1200);
    // 选择“自动校验结果”对应的 span 文本
    const locator = page.locator('p:has-text("自动校验结果") span');
    await locator.waitFor({ state: 'visible', timeout: 10000 });
    const text = (await locator.first().textContent())?.trim();
    console.log('[Playwright] 自动校验结果 =', text);
  } catch (e) {
    console.error('[Playwright] 检测失败:', e?.message || e);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();

