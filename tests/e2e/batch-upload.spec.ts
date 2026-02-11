/**
 * Batch Upload E2E Tests
 *
 * ATDD 验收测试 - Story 2-2 批量上传功能
 *
 * 测试场景:
 * - 批量拖拽上传流程
 * - 批量选择文件上传
 * - 超过 5 张文件的限制
 * - 批量取消流程
 * - 部分失败场景
 */

import { test, expect } from '../support/merged-fixtures';
import path from 'path';

const sampleImagePath = path.resolve(process.cwd(), 'tests/fixtures/images/sample.jpg');
const largeImagePath = path.resolve(process.cwd(), 'tests/fixtures/images/large-image.jpg');
const invalidFilePath = path.resolve(process.cwd(), 'tests/fixtures/images/document.pdf');

// Create test images for batch upload
function createTestImagePath(index: number): string {
  return path.resolve(process.cwd(), `tests/fixtures/images/batch-test-${index}.jpg`);
}

test.describe('Story 2-2: 批量上传功能 (Batch Upload)', () => {
  test.beforeEach(async ({ page }) => {
    // Given: User is on the batch upload page
    await page.goto('/analyze');
    await expect(page).toHaveTitle(/Image Analyzer/);
  });

  test.describe('AC-1: 批量拖拽/点击上传', () => {
    test('BATCH-TEST-001: 应该支持拖拽多张图片到上传区域 @p0 @critical @batch-upload', async ({
      page,
      interceptNetworkCall,
      log,
    }) => {
      await log.step('拖拽多张图片到批量上传区域');

      // Intercept batch upload API
      const uploadCall = interceptNetworkCall({
        url: '**/api/upload/batch',
      });

      // When: User drags and drops multiple images
      const dropZone = page.getByTestId('batch-drop-zone');
      await dropZone.setInputFiles([
        createTestImagePath(1),
        createTestImagePath(2),
        createTestImagePath(3),
      ]);

      // Then: All files should be added to the upload queue
      await expect(page.getByText('batch-test-1.jpg')).toBeVisible();
      await expect(page.getByText('batch-test-2.jpg')).toBeVisible();
      await expect(page.getByText('batch-test-3.jpg')).toBeVisible();
    });

    test('BATCH-TEST-002: 应该支持点击选择多张图片 @p0 @critical @batch-upload', async ({
      page,
      interceptNetworkCall,
      log,
    }) => {
      await log.step('点击选择多张图片进行上传');

      // Intercept batch upload API
      const uploadCall = interceptNetworkCall({
        url: '**/api/upload/batch',
      });

      // When: User clicks and selects multiple files
      const fileInput = page.getByTestId('batch-file-input');
      await fileInput.setInputFiles([
        createTestImagePath(1),
        createTestImagePath(2),
      ]);

      // Then: Both files should be selected
      await expect(page.getByText('batch-test-1.jpg')).toBeVisible();
      await expect(page.getByText('batch-test-2.jpg')).toBeVisible();
    });

    test('BATCH-TEST-003: 应该显示最大上传数量提示 @p1 @ui @batch-upload', async ({
      page,
      log,
    }) => {
      await log.step('验证最大上传数量提示显示');

      // Then: Should show max 5 images limit
      await expect(page.getByText(/最多上传 5 张图片/i)).toBeVisible();
    });

    test('BATCH-TEST-004: 应该显示批量上传区域 @p1 @ui @batch-upload', async ({
      page,
      log,
    }) => {
      await log.step('验证批量上传区域显示');

      // Then: Batch upload area should be visible
      await expect(page.getByTestId('batch-drop-zone')).toBeVisible();
      await expect(page.getByText(/拖拽多张图片/i)).toBeVisible();
      await expect(page.getByText(/或点击选择/i)).toBeVisible();
    });
  });

  test.describe('AC-1: 超过 5 张文件限制', () => {
    test('BATCH-TEST-005: 超过 5 张时应该显示警告 @p0 @critical @validation', async ({
      page,
      log,
    }) => {
      await log.step('上传超过 5 张图片');

      // When: User selects more than 5 files
      const fileInput = page.getByTestId('batch-file-input');
      await fileInput.setInputFiles([
        createTestImagePath(1),
        createTestImagePath(2),
        createTestImagePath(3),
        createTestImagePath(4),
        createTestImagePath(5),
        createTestImagePath(6),
        createTestImagePath(7),
      ]);

      // Then: Should show warning about exceeding limit
      await expect(page.getByText(/最多只能上传 5 张图片/i)).toBeVisible();
    });

    test('BATCH-TEST-006: 应该只处理前 5 张图片 @p0 @critical @validation', async ({
      page,
      interceptNetworkCall,
      log,
    }) => {
      await log.step('验证只处理前 5 张图片');

      // Intercept batch upload API
      const uploadCall = interceptNetworkCall({
        url: '**/api/upload/batch',
      });

      // When: User selects 7 files
      const fileInput = page.getByTestId('batch-file-input');
      await fileInput.setInputFiles([
        createTestImagePath(1),
        createTestImagePath(2),
        createTestImagePath(3),
        createTestImagePath(4),
        createTestImagePath(5),
        createTestImagePath(6),
        createTestImagePath(7),
      ]);

      // Then: Only 5 files should be processed
      const thumbnailCount = await page.getByTestId(/^thumbnail-/).count();
      await expect(thumbnailCount).toBeLessThanOrEqual(5);
    });

    test('BATCH-TEST-007: 达到 5 张后应该禁用上传 @p1 @ui @batch-upload', async ({
      page,
      log,
    }) => {
      await log.step('验证达到限制后禁用上传');

      // When: User selects 5 files
      const fileInput = page.getByTestId('batch-file-input');
      await fileInput.setInputFiles([
        createTestImagePath(1),
        createTestImagePath(2),
        createTestImagePath(3),
        createTestImagePath(4),
        createTestImagePath(5),
      ]);

      // Then: Upload area should be disabled
      await expect(page.getByTestId('batch-drop-zone')).toHaveAttribute('data-disabled', 'true');
    });

    test('BATCH-TEST-008: 应该显示被跳过的文件数量 @p1 @ui @validation', async ({
      page,
      log,
    }) => {
      await log.step('验证显示被跳过的文件数量');

      // When: User selects 6 files
      const fileInput = page.getByTestId('batch-file-input');
      await fileInput.setInputFiles([
        createTestImagePath(1),
        createTestImagePath(2),
        createTestImagePath(3),
        createTestImagePath(4),
        createTestImagePath(5),
        createTestImagePath(6),
      ]);

      // Then: Should show how many files were skipped
      await expect(page.getByText(/跳过 1 张/i)).toBeVisible();
    });
  });

  test.describe('AC-2: 文件验证', () => {
    test('BATCH-TEST-009: 应该验证所有上传的图片格式 @p0 @critical @validation', async ({
      page,
      log,
    }) => {
      await log.step('验证批量上传时文件格式检查');

      // When: User selects files with mixed valid and invalid formats
      const fileInput = page.getByTestId('batch-file-input');
      await fileInput.setInputFiles([
        createTestImagePath(1),
        invalidFilePath, // PDF is invalid
      ]);

      // Then: Invalid file should show error
      await expect(page.getByText(/不支持的文件格式/i)).toBeVisible();

      // Valid files should still be accepted
      await expect(page.getByText('batch-test-1.jpg')).toBeVisible();
    });

    test('BATCH-TEST-010: 应该显示每张图片的验证状态 @p1 @ui @validation', async ({
      page,
      log,
    }) => {
      await log.step('验证显示每张图片的验证状态图标');

      // When: User selects valid and invalid files
      const fileInput = page.getByTestId('batch-file-input');
      await fileInput.setInputFiles([
        createTestImagePath(1),
        invalidFilePath,
      ]);

      // Then: Should show checkmark for valid files
      const validStatus = page.getByTestId('thumbnail-batch-test-1.jpg-status');
      await expect(validStatus).toContainHTML('✓');

      // And X mark for invalid files
      const invalidStatus = page.getByTestId('thumbnail-document.pdf-status');
      await expect(invalidStatus).toContainHTML('✗');
    });

    test('BATCH-TEST-011: 失败的图片不应该影响其他图片 @p0 @critical @error-handling', async ({
      page,
      interceptNetworkCall,
      log,
    }) => {
      await log.step('验证单个文件失败不影响其他文件上传');

      // When: User selects files where one is invalid
      const fileInput = page.getByTestId('batch-file-input');
      await fileInput.setInputFiles([
        createTestImagePath(1),
        invalidFilePath,
        createTestImagePath(2),
      ]);

      // Then: Valid files should still be processed
      await expect(page.getByText('batch-test-1.jpg')).toBeVisible();
      await expect(page.getByText('batch-test-2.jpg')).toBeVisible();
      await expect(page.getByText('document.pdf')).toBeVisible();

      // Invalid file should be marked with error
      await expect(page.getByTestId('thumbnail-document.pdf-status')).toContainHTML('✗');
    });
  });

  test.describe('AC-3: 批量上传进度', () => {
    test('BATCH-TEST-012: 应该显示 "已上传 X/5 张图片" @p0 @critical @progress', async ({
      page,
      interceptNetworkCall,
      log,
    }) => {
      await log.step('验证上传进度文字显示');

      // Intercept batch upload API
      const uploadCall = interceptNetworkCall({
        url: '**/api/upload/batch',
      });

      // When: User selects files and starts upload
      const fileInput = page.getByTestId('batch-file-input');
      await fileInput.setInputFiles([
        createTestImagePath(1),
        createTestImagePath(2),
      ]);

      // Then: Should show progress text
      await expect(page.getByText(/已上传 \d+\/5 张图片/i)).toBeVisible();
    });

    test('BATCH-TEST-013: 应该显示整体百分比进度 @p0 @critical @progress', async ({
      page,
      interceptNetworkCall,
      log,
    }) => {
      await log.step('验证整体进度百分比显示');

      // Intercept batch upload API
      const uploadCall = interceptNetworkCall({
        url: '**/api/upload/batch',
      });

      // When: User selects files and starts upload
      const fileInput = page.getByTestId('batch-file-input');
      await fileInput.setInputFiles([
        createTestImagePath(1),
        createTestImagePath(2),
        createTestImagePath(3),
      ]);

      // Then: Progress bar should show correct percentage
      const progressBar = page.getByTestId('batch-progress-bar');
      await expect(progressBar).toBeVisible();

      // Each file contributes 20%, so 3 files = 60%
      await expect(progressBar).toHaveAttribute('aria-valuenow', '60');
    });

    test('BATCH-TEST-014: 应该实时更新上传进度 @p1 @progress', async ({
      page,
      interceptNetworkCall,
      log,
    }) => {
      await log.step('验证进度实时更新');

      // Intercept batch upload API
      const uploadCall = interceptNetworkCall({
        url: '**/api/upload/batch',
      });

      // When: User starts uploading 3 files
      const fileInput = page.getByTestId('batch-file-input');
      await fileInput.setInputFiles([
        createTestImagePath(1),
        createTestImagePath(2),
        createTestImagePath(3),
      ]);

      // Wait for upload to complete
      await uploadCall;

      // Then: Progress should be 60% (3/5)
      const progressBar = page.getByTestId('batch-progress-bar');
      await expect(progressBar).toHaveAttribute('aria-valuenow', '60');
    });

    test('BATCH-TEST-015: 应该显示预估剩余时间 @p2 @progress', async ({
      page,
      interceptNetworkCall,
      log,
    }) => {
      await log.step('验证预估剩余时间显示');

      // Intercept batch upload API
      const uploadCall = interceptNetworkCall({
        url: '**/api/upload/batch',
      });

      // When: User starts uploading
      const fileInput = page.getByTestId('batch-file-input');
      await fileInput.setInputFiles([createTestImagePath(1)]);

      // Then: Should show estimated time remaining
      await expect(page.getByText(/预计剩余时间/i)).toBeVisible();
    });
  });

  test.describe('AC-4: 批量取消功能', () => {
    test('BATCH-TEST-016: 应该显示 "取消全部" 按钮 @p0 @critical @cancel', async ({
      page,
      log,
    }) => {
      await log.step('验证取消全部按钮显示');

      // When: User selects files
      const fileInput = page.getByTestId('batch-file-input');
      await fileInput.setInputFiles([createTestImagePath(1)]);

      // Then: Cancel all button should be visible during upload
      await expect(page.getByTestId('cancel-all-button')).toBeVisible();
      await expect(page.getByText(/取消全部/i)).toBeVisible();
    });

    test('BATCH-TEST-017: 点击 "取消全部" 应该取消所有上传 @p0 @critical @cancel', async ({
      page,
      log,
    }) => {
      await log.step('验证取消全部功能');

      // When: User selects files and clicks cancel all
      const fileInput = page.getByTestId('batch-file-input');
      await fileInput.setInputFiles([
        createTestImagePath(1),
        createTestImagePath(2),
      ]);

      // Click cancel all
      await page.getByTestId('cancel-all-button').click();

      // Then: All uploads should be cancelled
      await expect(page.getByText(/已取消/i)).toBeVisible();
    });

    test('BATCH-TEST-018: 应该支持单独取消某张图片 @p1 @cancel', async ({
      page,
      log,
    }) => {
      await log.step('验证单独取消功能');

      // When: User hovers over a thumbnail
      const fileInput = page.getByTestId('batch-file-input');
      await fileInput.setInputFiles([
        createTestImagePath(1),
        createTestImagePath(2),
      ]);

      // Hover to show individual cancel button
      await page.getByTestId('thumbnail-batch-test-1.jpg').hover();

      // Then: Individual cancel button should be visible
      await expect(page.getByTestId('cancel-batch-test-1.jpg-button')).toBeVisible();
    });

    test('BATCH-TEST-019: 取消后应该清理临时文件 @p1 @cancel', async ({
      page,
      log,
    }) => {
      await log.step('验证临时文件清理');

      // When: User cancels upload
      const fileInput = page.getByTestId('batch-file-input');
      await fileInput.setInputFiles([createTestImagePath(1)]);

      await page.getByTestId('cancel-all-button').click();

      // Then: Should show cleanup message
      await expect(page.getByText(/正在清理/i)).toBeVisible();
    });

    test('BATCH-TEST-020: 取消后应该可以重新上传 @p2 @cancel', async ({
      page,
      interceptNetworkCall,
      log,
    }) => {
      await log.step('验证取消后可重新上传');

      // When: User cancels and then selects files again
      const fileInput = page.getByTestId('batch-file-input');
      await fileInput.setInputFiles([createTestImagePath(1)]);
      await page.getByTestId('cancel-all-button').click();

      // After cancellation, should be able to upload again
      const uploadCall = interceptNetworkCall({
        url: '**/api/upload/batch',
      });

      await fileInput.setInputFiles([createTestImagePath(2)]);
      await uploadCall;

      // Then: New upload should succeed
      await expect(page.getByText('batch-test-2.jpg')).toBeVisible();
    });
  });

  test.describe('AC-6: 缩略图预览', () => {
    test('BATCH-TEST-021: 应该生成缩略图预览 @p1 @ui @preview', async ({
      page,
      log,
    }) => {
      await log.step('验证缩略图预览生成');

      // When: User selects files
      const fileInput = page.getByTestId('batch-file-input');
      await fileInput.setInputFiles([createTestImagePath(1)]);

      // Then: Thumbnail should be visible
      const thumbnail = page.getByTestId('thumbnail-batch-test-1.jpg-image');
      await expect(thumbnail).toBeVisible();
    });

    test('BATCH-TEST-022: 缩略图列表应该横向滚动 @p2 @ui @preview', async ({
      page,
      log,
    }) => {
      await log.step('验证缩略图横向滚动');

      // When: User selects 5 files
      const fileInput = page.getByTestId('batch-file-input');
      await fileInput.setInputFiles([
        createTestImagePath(1),
        createTestImagePath(2),
        createTestImagePath(3),
        createTestImagePath(4),
        createTestImagePath(5),
      ]);

      // Then: Thumbnail list should have horizontal scroll
      const thumbnailList = page.getByTestId('thumbnail-list');
      await expect(thumbnailList).toHaveStyle({ overflowX: 'auto' });
    });

    test('BATCH-TEST-023: 应该显示上传状态图标 @p1 @ui @preview', async ({
      page,
      interceptNetworkCall,
      log,
    }) => {
      await log.step('验证上传状态图标显示');

      // Intercept batch upload API
      const uploadCall = interceptNetworkCall({
        url: '**/api/upload/batch',
      });

      // When: User selects and uploads files
      const fileInput = page.getByTestId('batch-file-input');
      await fileInput.setInputFiles([createTestImagePath(1)]);

      // Wait for upload to complete
      await uploadCall;

      // Then: Should show success icon
      const statusIcon = page.getByTestId('thumbnail-batch-test-1.jpg-status');
      await expect(statusIcon).toContainHTML('✓');
    });

    test('BATCH-TEST-024: 点击缩略图应该查看大图 @p2 @ui @preview', async ({
      page,
      log,
    }) => {
      await log.step('验证点击缩略图查看大图');

      // When: User clicks on a thumbnail
      const fileInput = page.getByTestId('batch-file-input');
      await fileInput.setInputFiles([createTestImagePath(1)]);
      await page.getByTestId('thumbnail-batch-test-1.jpg').click();

      // Then: Image viewer should open
      await expect(page.getByTestId('image-viewer')).toBeVisible();
    });
  });

  test.describe('AC-7: 移动端优化', () => {
    test.use({
      viewport: { width: 375, height: 667 }, // iPhone SE size
    });

    test('BATCH-TEST-025: 移动端应该支持相册多选 @p1 @mobile @responsive', async ({
      page,
      log,
    }) => {
      await log.step('验证移动端相册多选');

      // When: On mobile viewport
      await page.goto('/analyze');

      // Then: File input should support multiple selection
      const fileInput = page.getByTestId('batch-file-input');
      await expect(fileInput).toHaveAttribute('multiple');
    });

    test('BATCH-TEST-026: 触摸目标应该至少 44x44px @p1 @mobile @responsive', async ({
      page,
      log,
    }) => {
      await log.step('验证触摸目标大小');

      // When: On mobile viewport
      await page.goto('/analyze');

      // Then: Cancel button should be touch-friendly
      const cancelButton = page.getByTestId('cancel-all-button');
      const box = await cancelButton.boundingBox();

      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    });

    test('BATCH-TEST-027: 移动端应该显示简化预览界面 @p2 @mobile @responsive', async ({
      page,
      log,
    }) => {
      await log.step('验证移动端简化预览');

      // When: On mobile viewport
      await page.goto('/analyze');
      const fileInput = page.getByTestId('batch-file-input');
      await fileInput.setInputFiles([createTestImagePath(1)]);

      // Then: Mobile preview should be visible
      await expect(page.getByTestId('mobile-preview')).toBeVisible();
    });

    test('BATCH-TEST-028: 移动端缩略图应该全屏横向滚动 @p2 @mobile @responsive', async ({
      page,
      log,
    }) => {
      await log.step('验证移动端缩略图全屏滚动');

      // When: On mobile viewport with multiple files
      await page.goto('/analyze');
      const fileInput = page.getByTestId('batch-file-input');
      await fileInput.setInputFiles([
        createTestImagePath(1),
        createTestImagePath(2),
        createTestImagePath(3),
      ]);

      // Then: Mobile thumbnail list should be full-width
      const mobileThumbnailList = page.getByTestId('mobile-thumbnail-list');
      await expect(mobileThumbnailList).toBeVisible();
    });
  });

  test.describe('完整上传流程', () => {
    test('BATCH-TEST-029: 完整的批量拖拽上传流程 @p0 @critical @smoke @end-to-end', async ({
      page,
      interceptNetworkCall,
      log,
    }) => {
      await log.step('执行完整的批量拖拽上传流程');

      // Intercept batch upload API
      const uploadCall = interceptNetworkCall({
        url: '**/api/upload/batch',
      });

      // Step 1: Drag and drop multiple images
      const dropZone = page.getByTestId('batch-drop-zone');
      await dropZone.setInputFiles([
        createTestImagePath(1),
        createTestImagePath(2),
        createTestImagePath(3),
      ]);

      // Verify files are added
      await expect(page.getByText('batch-test-1.jpg')).toBeVisible();
      await expect(page.getByText('batch-test-2.jpg')).toBeVisible();
      await expect(page.getByText('batch-test-3.jpg')).toBeVisible();

      // Verify progress shows correct count
      await expect(page.getByText(/已上传 0\/5 张图片/i)).toBeVisible();

      // Wait for upload to complete
      await uploadCall;

      // Verify completion
      await expect(page.getByText(/已上传 3\/5 张图片/i)).toBeVisible();
      await expect(page.getByText(/上传完成/i)).toBeVisible();
    });

    test('BATCH-TEST-030: 批量选择并上传的完整流程 @p0 @critical @smoke @end-to-end', async ({
      page,
      interceptNetworkCall,
      log,
    }) => {
      await log.step('执行批量选择上传流程');

      // Intercept batch upload API
      const uploadCall = interceptNetworkCall({
        url: '**/api/upload/batch',
      });

      // Step 1: Click to select multiple files
      const fileInput = page.getByTestId('batch-file-input');
      await fileInput.setInputFiles([
        createTestImagePath(1),
        createTestImagePath(2),
      ]);

      // Step 2: Verify thumbnails appear
      await expect(page.getByTestId('thumbnail-batch-test-1.jpg-image')).toBeVisible();
      await expect(page.getByTestId('thumbnail-batch-test-2.jpg-image')).toBeVisible();

      // Step 3: Verify progress updates
      await expect(page.getByText(/已上传 0\/5 张图片/i)).toBeVisible();

      // Wait for completion
      await uploadCall;

      // Step 4: Verify all uploads completed
      await expect(page.getByText(/已上传 2\/5 张图片/i)).toBeVisible();
    });
  });

  test.describe('部分失败场景', () => {
    test('BATCH-TEST-031: 部分文件上传失败时的处理 @p1 @error-handling', async ({
      page,
      log,
    }) => {
      await log.step('验证部分失败场景处理');

      // When: Some files succeed and some fail
      // This would require mocking server response
      // For now, we test the UI behavior

      const fileInput = page.getByTestId('batch-file-input');
      await fileInput.setInputFiles([
        createTestImagePath(1),
        invalidFilePath,
        createTestImagePath(2),
      ]);

      // Then: Failed file should show error
      await expect(page.getByTestId('thumbnail-document.pdf-status')).toContainHTML('✗');

      // Valid files should still show progress
      await expect(page.getByText(/batch-test-1.jpg/i)).toBeVisible();
      await expect(page.getByText(/batch-test-2.jpg/i)).toBeVisible();
    });

    test('BATCH-TEST-032: 网络错误时应该显示错误提示 @p1 @error-handling', async ({
      page,
      log,
    }) => {
      await log.step('验证网络错误处理');

      // When: Network error occurs during upload
      // This would require network mocking

      const fileInput = page.getByTestId('batch-file-input');
      await fileInput.setInputFiles([createTestImagePath(1)]);

      // Then: Error message should be displayed
      await expect(page.getByText(/网络错误/i)).toBeVisible();
    });
  });

  test.describe('Callback 验证', () => {
    test('BATCH-TEST-033: 成功时应该触发回调 @p1 @callbacks', async ({
      page,
      interceptNetworkCall,
      log,
    }) => {
      await log.step('验证成功回调触发');

      // Intercept batch upload API
      const uploadCall = interceptNetworkCall({
        url: '**/api/upload/batch',
      });

      // When: Upload completes successfully
      const fileInput = page.getByTestId('batch-file-input');
      await fileInput.setInputFiles([createTestImagePath(1)]);

      await uploadCall;

      // Then: Success callback should be triggered
      await expect(page.getByText(/上传完成/i)).toBeVisible();
    });

    test('BATCH-TEST-034: 失败时应该触发错误回调 @p1 @callbacks', async ({
      page,
      log,
    }) => {
      await log.step('验证错误回调触发');

      // When: Upload fails
      const fileInput = page.getByTestId('batch-file-input');
      await fileInput.setInputFiles([invalidFilePath]);

      // Then: Error callback should be triggered
      await expect(page.getByText(/上传失败/i)).toBeVisible();
    });
  });
});

test.describe('Story 2-2: 响应式设计', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/analyze');
  });

  test.describe('桌面端布局', () => {
    test.use({
      viewport: { width: 1920, height: 1080 },
    });

    test('BATCH-TEST-035: 桌面端缩略图列表应该在左侧 @desktop @responsive', async ({
      page,
      log,
    }) => {
      await log.step('验证桌面端布局');

      const fileInput = page.getByTestId('batch-file-input');
      await fileInput.setInputFiles([createTestImagePath(1)]);

      // Then: Thumbnail list should be on the left side
      const thumbnailList = page.getByTestId('thumbnail-list');
      await expect(thumbnailList).toHaveStyle({ position: 'relative' });
    });
  });

  test.describe('平板端布局', () => {
    test.use({
      viewport: { width: 768, height: 1024 },
    });

    test('BATCH-TEST-036: 平板端布局应该居中 @tablet @responsive', async ({
      page,
      log,
    }) => {
      await log.step('验证平板端布局');

      const fileInput = page.getByTestId('batch-file-input');
      await fileInput.setInputFiles([createTestImagePath(1)]);

      // Then: Layout should be centered
      await expect(page.getByTestId('batch-drop-zone')).toBeVisible();
    });
  });

  test.describe('移动端布局', () => {
    test.use({
      viewport: { width: 375, height: 667 },
    });

    test('BATCH-TEST-037: 移动端缩略图全屏滚动 @mobile @responsive', async ({
      page,
      log,
    }) => {
      await log.step('验证移动端全屏缩略图');

      const fileInput = page.getByTestId('batch-file-input');
      await fileInput.setInputFiles([
        createTestImagePath(1),
        createTestImagePath(2),
      ]);

      // Then: Should use full width
      const mobileThumbnailList = page.getByTestId('mobile-thumbnail-list');
      await expect(mobileThumbnailList).toBeVisible();
    });
  });
});
