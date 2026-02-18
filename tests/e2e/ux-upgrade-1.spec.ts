import { test, expect } from '@playwright/test';
import path from 'path';

const sampleImagePath = path.resolve(process.cwd(), 'tests/fixtures/images/analysis/portrait-lighting.jpg');

test.describe('UX-UPGRADE-1', () => {
  test('should support auto-start flow, progress details, and result quick actions @smoke @critical', async ({ page, browserName }) => {
    let statusPollCount = 0;

    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: { name: 'E2E User', email: 'e2e@example.com' },
          expires: '2099-01-01T00:00:00.000Z',
        }),
      });
    });

    await page.route('**/api/user/terms-status', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { requiresAgreement: false },
        }),
      });
    });

    await page.route('**/api/analysis/models', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            models: [
              {
                id: 'mock-model',
                name: 'Mock Model',
                description: 'Mocked model for E2E',
                features: ['fast'],
                isDefault: true,
                enabled: true,
                requiresTier: 'free',
                isLocked: false,
              },
            ],
          },
        }),
      });
    });

    await page.route('**/api/upload', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            imageId: 'mock-image-1',
            filePath: 'uploads/mock.jpg',
            fileSize: 1024,
            fileFormat: 'JPEG',
            width: 800,
            height: 600,
            url: 'https://example.com/mock.jpg',
          },
        }),
      });
    });

    await page.route('**/api/analysis', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: { analysisId: 777, status: 'pending' },
        }),
      });
    });

    await page.route('**/api/analysis/777/status', async (route) => {
      statusPollCount += 1;
      if (statusPollCount < 2) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { status: 'analyzing', progress: 50 },
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            status: 'completed',
            progress: 100,
            result: {
              dimensions: {
                lighting: {
                  name: '光影',
                  features: [{ name: '主光', value: '侧光', confidence: 0.9 }],
                  confidence: 0.9,
                },
                composition: {
                  name: '构图',
                  features: [{ name: '比例', value: '黄金分割', confidence: 0.88 }],
                  confidence: 0.88,
                },
                color: {
                  name: '色彩',
                  features: [{ name: '主色', value: '暖色', confidence: 0.86 }],
                  confidence: 0.86,
                },
                artisticStyle: {
                  name: '风格',
                  features: [{ name: '风格', value: '写实', confidence: 0.84 }],
                  confidence: 0.84,
                },
              },
              overallConfidence: 0.87,
              modelUsed: 'mock-model',
              analysisDuration: 15,
            },
          },
        }),
      });
    });

    await page.goto('/analysis');
    await expect(page.getByText('AI 风格分析')).toBeVisible();

    await expect(page).toHaveScreenshot(`ux-upgrade-home-${browserName}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.001,
    });

    const fileInput = page.getByTestId('image-upload-input');
    await fileInput.setInputFiles(sampleImagePath);

    const continueAnyway = page.getByTestId('continue-anyway-btn');
    if (await continueAnyway.isVisible({ timeout: 2000 }).catch(() => false)) {
      await continueAnyway.click();
    }

    const manualAnalyzeButton = page.getByTestId('analyze-button');
    if (await manualAnalyzeButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await manualAnalyzeButton.click();
    }

    await expect(page.getByTestId('analysis-stage-description')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('analysis-stage-description')).toContainText('当前阶段');
    await expect(page.getByTestId('cancel-analysis-button')).toBeVisible();

    await expect(page).toHaveScreenshot(`ux-upgrade-progress-${browserName}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.001,
    });

    await expect(page.getByTestId('analysis-result')).toBeVisible({ timeout: 20000 });
    await expect(page.getByTestId('copy-analysis-summary')).toBeVisible();
    await page.getByTestId('toggle-analysis-details').click();
    await expect(page.getByTestId('dimension-lighting')).toBeVisible();

    await expect(page).toHaveScreenshot(`ux-upgrade-result-${browserName}.png`, {
      fullPage: true,
      maxDiffPixelRatio: 0.001,
    });
  });
});
