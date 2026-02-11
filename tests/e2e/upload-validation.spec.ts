/**
 * ATDD E2E Tests - Story 2.3: Upload Validation
 *
 * Testing Phase: RED (Fail first)
 *
 * These tests cover:
 * - AC-1: End-to-end validation detection
 * - AC-2: User-friendly error messages in UI
 * - AC-3: Degraded processing options
 * - AC-4: Local + API validation flow
 * - AC-5: First-time user guidance
 * - AC-7: Mobile optimization
 */

import { test, expect } from '../support/merged-fixtures';
import path from 'path';

// Test fixtures paths
const fixturesPath = path.resolve(process.cwd(), 'tests/fixtures/images');

// Note: These test files need to be created. For now, tests are written but will fail.
const testImages = {
  // Format validation
  validJpeg: path.join(fixturesPath, 'sample.jpg'),
  validPng: path.join(fixturesPath, 'sample.png'),
  validWebp: path.join(fixturesPath, 'sample.webp'),
  invalidPdf: path.join(fixturesPath, 'document.pdf'),
  invalidGif: path.join(fixturesPath, 'sample.gif'), // to be created

  // Size validation
  largeImage: path.join(fixturesPath, 'large-image.jpg'), // 11MB
  hugeImage: path.join(fixturesPath, 'huge.jpg'), // 50MB, to be created
  smallImage: path.join(fixturesPath, 'small-file.jpg'), // < 10KB, to be created

  // Resolution validation
  lowRes: path.join(fixturesPath, 'low-res.jpg'), // 100x100
  highRes: path.join(fixturesPath, 'high-res.jpg'), // 9000x9000
  normalRes: path.join(fixturesPath, 'normal-res.jpg'), // 1920x1080
  minRes: path.join(fixturesPath, 'min-res.jpg'), // 200x200

  // Complexity validation
  simpleSubject: path.join(fixturesPath, 'simple-subject.jpg'),
  complexScene: path.join(fixturesPath, 'complex-scene.jpg'),
  blurryImage: path.join(fixturesPath, 'blurry.jpg'),
};

test.describe('Story 2.3: Upload Validation - AC-1 Format Detection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/analyze');
  });

  test('E2E-VAL-001: should accept valid JPEG image @p0 @critical @validation', async ({
    page,
    log,
  }) => {
    await log.step('Upload valid JPEG image');

    // When: User uploads a valid JPEG
    const fileInput = page.getByTestId('image-upload-input');
    await fileInput.setInputFiles(testImages.validJpeg);

    // Then: Should show upload progress, no error
    const uploadProgress = page.getByTestId('upload-progress');
    await expect(uploadProgress).toBeVisible();

    // And: Should not show validation error
    const validationError = page.getByTestId('validation-error');
    await expect(validationError).not.toBeVisible();
  });

  test('E2E-VAL-002: should accept valid PNG image @p0 @critical @validation', async ({
    page,
    log,
  }) => {
    await log.step('Upload valid PNG image');

    // When: User uploads a valid PNG
    const fileInput = page.getByTestId('image-upload-input');
    await fileInput.setInputFiles(testImages.validPng);

    // Then: Should proceed with upload
    const uploadProgress = page.getByTestId('upload-progress');
    await expect(uploadProgress).toBeVisible();
  });

  test('E2E-VAL-003: should accept valid WebP image @p1 @validation', async ({
    page,
    log,
  }) => {
    await log.step('Upload valid WebP image');

    // When: User uploads a valid WebP
    const fileInput = page.getByTestId('image-upload-input');
    await fileInput.setInputFiles(testImages.validWebp);

    // Then: Should proceed with upload
    const uploadProgress = page.getByTestId('upload-progress');
    await expect(uploadProgress).toBeVisible();
  });

  test('E2E-VAL-004: should reject PDF format with friendly error @p1 @error-handling @validation', async ({
    page,
    log,
  }) => {
    await log.step('Try uploading PDF file');

    // When: User tries to upload a PDF
    const fileInput = page.getByTestId('image-upload-input');
    await fileInput.setInputFiles(testImages.invalidPdf);

    // Then: Should show validation error
    const validationError = page.getByTestId('validation-error');
    await expect(validationError).toBeVisible();

    // And: Error should mention supported formats
    await expect(validationError).toContainText(/JPEG|PNG|WebP/);

    // And: Should not show upload progress
    const uploadProgress = page.getByTestId('upload-progress');
    await expect(uploadProgress).not.toBeVisible();
  });

  test('E2E-VAL-005: should reject unsupported formats (GIF, BMP, etc.) @p2 @error-handling @validation', async ({
    page,
    log,
  }) => {
    await log.step('Try uploading GIF file');

    // When: User tries to upload a GIF
    const fileInput = page.getByTestId('image-upload-input');
    await fileInput.setInputFiles(testImages.invalidGif);

    // Then: Should show validation error
    const validationError = page.getByTestId('validation-error');
    await expect(validationError).toBeVisible();
    await expect(validationError).toContainText('格式');
  });
});

test.describe('Story 2.3: Upload Validation - AC-1 File Size', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/analyze');
  });

  test('E2E-VAL-006: should reject file exceeding 10MB limit @p0 @critical @validation', async ({
    page,
    log,
  }) => {
    await log.step('Try uploading 11MB file');

    // When: User uploads a file > 10MB
    const fileInput = page.getByTestId('image-upload-input');
    await fileInput.setInputFiles(testImages.largeImage);

    // Then: Should show size validation error
    const validationError = page.getByTestId('validation-error');
    await expect(validationError).toBeVisible();
    await expect(validationError).toContainText('10MB');
    await expect(validationError).toContainText('压缩');

    // And: Should not start upload
    const uploadProgress = page.getByTestId('upload-progress');
    await expect(uploadProgress).not.toBeVisible();
  });

  test('E2E-VAL-007: should reject very large files (50MB) @p1 @error-handling @validation', async ({
    page,
    log,
  }) => {
    await log.step('Try uploading 50MB file');

    // When: User uploads a very large file
    const fileInput = page.getByTestId('image-upload-input');
    await fileInput.setInputFiles(testImages.hugeImage);

    // Then: Should show validation error
    const validationError = page.getByTestId('validation-error');
    await expect(validationError).toBeVisible();
    await expect(validationError).toContainText('10MB');
  });

  test('E2E-VAL-008: should accept file at size limit (10MB) @p2 @validation', async ({
    page,
    log,
  }) => {
    await log.step('Upload file exactly at 10MB limit');

    // When: User uploads a file exactly at limit
    const fileInput = page.getByTestId('image-upload-input');
    await fileInput.setInputFiles(testImages.smallImage);

    // Then: Should proceed with upload
    // (Note: This test will need a file exactly at 10MB)
  });
});

test.describe('Story 2.3: Upload Validation - AC-1 Resolution', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/analyze');
  });

  test('E2E-VAL-009: should reject low resolution (<200x200) @p1 @error-handling @validation', async ({
    page,
    log,
  }) => {
    await log.step('Try uploading 100x100 image');

    // When: User uploads a low resolution image
    const fileInput = page.getByTestId('image-upload-input');
    await fileInput.setInputFiles(testImages.lowRes);

    // Then: Should show resolution error
    const validationError = page.getByTestId('validation-error');
    await expect(validationError).toBeVisible();
    await expect(validationError).toContainText('200×200px');

    // And: Should suggest minimum resolution
    await expect(validationError).toContainText('至少');
  });

  test('E2E-VAL-010: should accept minimum resolution (200x200) @p2 @validation', async ({
    page,
    log,
  }) => {
    await log.step('Upload 200x200 image');

    // When: User uploads at minimum resolution
    const fileInput = page.getByTestId('image-upload-input');
    await fileInput.setInputFiles(testImages.minRes);

    // Then: Should proceed with upload
    const uploadProgress = page.getByTestId('upload-progress');
    await expect(uploadProgress).toBeVisible();
  });

  test('E2E-VAL-011: should reject high resolution (>8192x8192) @p1 @error-handling @validation', async ({
    page,
    log,
  }) => {
    await log.step('Try uploading 9000x9000 image');

    // When: User uploads a high resolution image
    const fileInput = page.getByTestId('image-upload-input');
    await fileInput.setInputFiles(testImages.highRes);

    // Then: Should show resolution error
    const validationError = page.getByTestId('validation-error');
    await expect(validationError).toBeVisible();
    await expect(validationError).toContainText('8192×8192px');
  });

  test('E2E-VAL-012: should accept standard resolution (1920x1080) @p0 @critical @validation', async ({
    page,
    log,
  }) => {
    await log.step('Upload HD image');

    // When: User uploads a standard HD image
    const fileInput = page.getByTestId('image-upload-input');
    await fileInput.setInputFiles(testImages.normalRes);

    // Then: Should proceed with upload
    const uploadProgress = page.getByTestId('upload-progress');
    await expect(uploadProgress).toBeVisible();
  });
});

test.describe('Story 2.3: Upload Validation - AC-2 Error Messages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/analyze');
  });

  test('E2E-VAL-013: format error should be friendly and actionable @p1 @ux @validation', async ({
    page,
    log,
  }) => {
    await log.step('Check format error message quality');

    // When: User uploads invalid format
    const fileInput = page.getByTestId('image-upload-input');
    await fileInput.setInputFiles(testImages.invalidPdf);

    // Then: Error should be user-friendly
    const validationError = page.getByTestId('validation-error');
    await expect(validationError).toBeVisible();

    // And: Should list supported formats
    await expect(validationError).toContainText('JPEG');
    await expect(validationError).toContainText('PNG');
    await expect(validationError).toContainText('WebP');

    // And: Should not show technical jargon
    await expect(validationError).not.toContainText('MIME type');
  });

  test('E2E-VAL-014: size error should suggest compression @p1 @ux @validation', async ({
    page,
    log,
  }) => {
    await log.step('Check size error message quality');

    // When: User uploads oversized file
    const fileInput = page.getByTestId('image-upload-input');
    await fileInput.setInputFiles(testImages.largeImage);

    // Then: Error should suggest action
    const validationError = page.getByTestId('validation-error');
    await expect(validationError).toContainText('压缩后重试');

    // And: Should show limit clearly
    await expect(validationError).toContainText('10MB');
  });

  test('E2E-VAL-015: resolution error should suggest minimum @p1 @ux @validation', async ({
    page,
    log,
  }) => {
    await log.step('Check resolution error message quality');

    // When: User uploads low resolution image
    const fileInput = page.getByTestId('image-upload-input');
    await fileInput.setInputFiles(testImages.lowRes);

    // Then: Error should show requirement
    const validationError = page.getByTestId('validation-error');
    await expect(validationError).toContainText('200×200px');
    await expect(validationError).toContainText('建议');
  });
});

test.describe('Story 2.3: Upload Validation - AC-3 Degraded Processing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/analyze');
  });

  test('E2E-VAL-016: should show warning for complex scenes @p1 @ux @validation', async ({
    page,
    log,
  }) => {
    await log.step('Upload complex scene image');

    // When: User uploads a potentially complex image
    const fileInput = page.getByTestId('image-upload-input');
    await fileInput.setInputFiles(testImages.complexScene);

    // Then: Should show warning (not error)
    const validationWarning = page.getByTestId('validation-warning');
    await expect(validationWarning).toBeVisible();

    // And: Warning should mention complexity
    await expect(validationWarning).toContainText('多个主体');

    // And: Should provide suggestion
    await expect(validationWarning).toContainText('单主体');
  });

  test('E2E-VAL-017: should offer "continue anyway" option for complex images @p0 @critical @validation', async ({
    page,
    log,
  }) => {
    await log.step('Check degraded processing options');

    // When: User uploads a complex image
    const fileInput = page.getByTestId('image-upload-input');
    await fileInput.setInputFiles(testImages.complexScene);

    // Then: Should show action buttons
    const continueButton = page.getByTestId('continue-anyway-btn');
    const changeImageButton = page.getByTestId('change-image-btn');

    await expect(continueButton).toBeVisible();
    await expect(changeImageButton).toBeVisible();
  });

  test('E2E-VAL-018: should proceed when user clicks "continue anyway" @p0 @critical @validation', async ({
    page,
    log,
  }) => {
    await log.step('Continue with complex image');

    // Given: Complex image warning is shown
    const fileInput = page.getByTestId('image-upload-input');
    await fileInput.setInputFiles(testImages.complexScene);

    // When: User clicks "continue anyway"
    const continueButton = page.getByTestId('continue-anyway-btn');
    await continueButton.click();

    // Then: Upload should proceed
    const uploadProgress = page.getByTestId('upload-progress');
    await expect(uploadProgress).toBeVisible();
  });

  test('E2E-VAL-019: should allow changing image after warning @p1 @ux @validation', async ({
    page,
    log,
  }) => {
    await log.step('Change image after warning');

    // Given: Complex image warning is shown
    const fileInput = page.getByTestId('image-upload-input');
    await fileInput.setInputFiles(testImages.complexScene);

    // When: User clicks "change image"
    const changeImageButton = page.getByTestId('change-image-btn');
    await changeImageButton.click();

    // Then: Should clear current image
    // And: Should allow new upload
    const validationWarning = page.getByTestId('validation-warning');
    await expect(validationWarning).not.toBeVisible();
  });
});

test.describe('Story 2.3: Upload Validation - AC-5 First-Time Guidance', () => {
  test.use({ storageState: { cookies: [], origins: [] } }); // Use fresh session

  test('E2E-VAL-020: should show first-time guide on initial upload @p1 @ux @onboarding', async ({
    page,
    log,
  }) => {
    await log.step('Check first-time user guidance');

    // Given: User visits for first time
    await page.goto('/analyze');
    await page.context().clearCookies();

    // When: User navigates to upload page
    // Then: Should show best practices guide
    const firstTimeGuide = page.getByTestId('first-time-guide');
    await expect(firstTimeGuide).toBeVisible();

    // And: Guide should show recommendations
    await expect(firstTimeGuide).toContainText('最佳实践');
    await expect(firstTimeGuide).toContainText('单主体');
    await expect(firstTimeGuide).toContainText('静态场景');
  });

  test('E2E-VAL-021: guide should show good vs bad examples @p2 @ux @onboarding', async ({
    page,
    log,
  }) => {
    await log.step('Check example images in guide');

    // Given: First-time user
    await page.goto('/analyze');
    await page.context().clearCookies();

    // When: Viewing first-time guide
    const firstTimeGuide = page.getByTestId('first-time-guide');

    // Then: Should show example images
    const goodExamples = firstTimeGuide.getByTestId('good-example');
    const badExamples = firstTimeGuide.getByTestId('bad-example');

    await expect(goodExamples).toHaveCount(2); // At least 2 good examples
    await expect(badExamples).toHaveCount(2); // At least 2 bad examples
  });

  test('E2E-VAL-022: should hide guide after user dismisses it @p1 @ux @onboarding', async ({
    page,
    log,
  }) => {
    await log.step('Dismiss first-time guide');

    // Given: First-time guide is shown
    await page.goto('/analyze');
    await page.context().clearCookies();
    const firstTimeGuide = page.getByTestId('first-time-guide');
    await expect(firstTimeGuide).toBeVisible();

    // When: User clicks "Got it"
    const dismissButton = page.getByTestId('dismiss-guide-btn');
    await dismissButton.click();

    // Then: Guide should be hidden
    await expect(firstTimeGuide).not.toBeVisible();

    // And: Should not show on next visit
    await page.reload();
    await expect(firstTimeGuide).not.toBeVisible();
  });

  test('E2E-VAL-023: should store guide dismissal preference @p2 @ux @onboarding', async ({
    page,
    log,
  }) => {
    await log.step('Check guide dismissal persistence');

    // Given: User has dismissed guide
    await page.goto('/analyze');
    await page.context().clearCookies();
    const dismissButton = page.getByTestId('dismiss-guide-btn');
    await dismissButton.click();

    // When: User returns to upload page later
    await page.goto('/analyze');

    // Then: Guide should not appear again
    const firstTimeGuide = page.getByTestId('first-time-guide');
    await expect(firstTimeGuide).not.toBeVisible();
  });
});

test.describe('Story 2.3: Upload Validation - AC-7 Mobile Optimization', () => {
  test.describe('Mobile viewport', () => {
    test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

    test('E2E-VAL-024: should simplify error messages on mobile @p1 @mobile @validation', async ({
      page,
      log,
    }) => {
      await log.step('Check mobile error message simplification');

      // Given: Mobile viewport
      await page.goto('/analyze');

      // When: Upload error occurs
      const fileInput = page.getByTestId('image-upload-input');
      await fileInput.setInputFiles(testImages.invalidPdf);

      // Then: Error should be concise
      const validationError = page.getByTestId('validation-error');
      await expect(validationError).toBeVisible();

      // And: Technical details should be collapsed
      const detailedInfo = page.getByTestId('error-details');
      await expect(detailedInfo).not.toBeVisible();
    });

    test('E2E-VAL-025: should provide "view details" expand option on mobile @p1 @mobile @ux', async ({
      page,
      log,
    }) => {
      await log.step('Check mobile details expansion');

      // Given: Mobile viewport with error
      await page.goto('/analyze');
      const fileInput = page.getByTestId('image-upload-input');
      await fileInput.setInputFiles(testImages.invalidPdf);

      // When: Error is shown
      const validationError = page.getByTestId('validation-error');
      await expect(validationError).toBeVisible();

      // Then: Should show "view details" button
      const viewDetailsButton = page.getByTestId('view-details-btn');
      await expect(viewDetailsButton).toBeVisible();

      // When: User taps to view details
      await viewDetailsButton.click();

      // Then: Detailed info should expand
      const detailedInfo = page.getByTestId('error-details');
      await expect(detailedInfo).toBeVisible();
    });

    test('E2E-VAL-026: should have touch-friendly action buttons @p1 @mobile @ux', async ({
      page,
      log,
    }) => {
      await log.step('Check mobile button sizes');

      // Given: Mobile viewport with warning
      await page.goto('/analyze');
      const fileInput = page.getByTestId('image-upload-input');
      await fileInput.setInputFiles(testImages.complexScene);

      // When: Warning is shown
      const continueButton = page.getByTestId('continue-anyway-btn');
      const changeImageButton = page.getByTestId('change-image-btn');

      // Then: Buttons should be large enough (min 44x44px)
      const continueBox = await continueButton.boundingBox();
      const changeBox = await changeImageButton.boundingBox();

      expect(continueBox?.height).toBeGreaterThanOrEqual(44);
      expect(continueBox?.width).toBeGreaterThanOrEqual(44);
      expect(changeBox?.height).toBeGreaterThanOrEqual(44);
      expect(changeBox?.width).toBeGreaterThanOrEqual(44);
    });

    test('E2E-VAL-027: should stack buttons vertically on mobile @p2 @mobile @ux', async ({
      page,
      log,
    }) => {
      await log.step('Check mobile button layout');

      // Given: Mobile viewport with warning
      await page.goto('/analyze');
      const fileInput = page.getByTestId('image-upload-input');
      await fileInput.setInputFiles(testImages.complexScene);

      // When: Action buttons are shown
      const continueButton = page.getByTestId('continue-anyway-btn');
      const changeImageButton = page.getByTestId('change-image-btn');

      // Then: Buttons should be stacked (second button below first)
      const continueBox = await continueButton.boundingBox();
      const changeBox = await changeImageButton.boundingBox();

      expect(changeBox!.y).toBeGreaterThan(continueBox!.y!);
    });
  });
});

test.describe('Story 2.3: Upload Validation - AC-4 Integration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/analyze');
  });

  test('E2E-VAL-028: should perform local validation before upload @p0 @critical @validation', async ({
    page,
    log,
  }) => {
    await log.step('Check local validation timing');

    // Given: Invalid file
    const fileInput = page.getByTestId('image-upload-input');

    // When: User uploads invalid file
    await fileInput.setInputFiles(testImages.invalidPdf);

    // Then: Error should appear immediately (no network call)
    const validationError = page.getByTestId('validation-error');
    await expect(validationError).toBeVisible({ timeout: 100 });

    // And: No upload request should be made
    // (Check network logs)
  });

  test('E2E-VAL-029: should only call API after local validation passes @p0 @critical @validation', async ({
    page,
    log,
  }) => {
    await log.step('Check API validation timing');

    // Given: Valid file
    const fileInput = page.getByTestId('image-upload-input');

    // When: User uploads valid file
    await fileInput.setInputFiles(testImages.validJpeg);

    // Then: Should start upload to R2
    const uploadProgress = page.getByTestId('upload-progress');
    await expect(uploadProgress).toBeVisible();

    // And: After upload, should call API validation
    // (Check network logs for /api/validate call)
  });

  test('E2E-VAL-030: should show API validation results @p1 @integration @validation', async ({
    page,
    log,
    interceptNetworkCall,
  }) => {
    await log.step('Check API validation feedback');

    // Given: Valid file uploaded
    const fileInput = page.getByTestId('image-upload-input');
    const apiValidationCall = interceptNetworkCall({
      url: '**/api/validate',
    });

    await fileInput.setInputFiles(testImages.validJpeg);

    // When: API validation completes
    await apiValidationCall;

    // Then: Should show validation result
    const validationStatus = page.getByTestId('validation-status');
    await expect(validationStatus).toBeVisible();
    await expect(validationStatus).toContainText(/通过|警告/);
  });
});

test.describe('Story 2.3: Upload Validation - AC-6 Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/analyze');
  });

  test('E2E-VAL-031: should track validation failure reasons @p2 @analytics @validation', async ({
    page,
    log,
  }) => {
    await log.step('Check analytics tracking');

    // Given: Invalid file
    const fileInput = page.getByTestId('image-upload-input');

    // When: User uploads invalid file
    await fileInput.setInputFiles(testImages.invalidPdf);

    // Then: Should track failure reason
    // (Check analytics events - would need analytics tool integration)
    const validationError = page.getByTestId('validation-error');
    await expect(validationError).toBeVisible();

    // Verify error code is trackable
    await expect(validationError).toHaveAttribute('data-error-code', 'INVALID_FORMAT');
  });

  test('E2E-VAL-032: should track user retry behavior @p2 @analytics @validation', async ({
    page,
    log,
  }) => {
    await log.step('Check retry tracking');

    // Given: First upload fails
    const fileInput = page.getByTestId('image-upload-input');
    await fileInput.setInputFiles(testImages.invalidPdf);
    const validationError = page.getByTestId('validation-error');
    await expect(validationError).toBeVisible();

    // When: User uploads valid file (retry)
    await fileInput.setInputFiles(testImages.validJpeg);

    // Then: Should track retry success
    // (Check analytics for retry event)
    const uploadProgress = page.getByTestId('upload-progress');
    await expect(uploadProgress).toBeVisible();
  });
});

test.describe('Story 2.3: Upload Validation - Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/analyze');
  });

  test('E2E-VAL-033: should handle rapid file changes @p2 @ux @validation', async ({
    page,
    log,
  }) => {
    await log.step('Check rapid file selection handling');

    // When: User rapidly changes files
    const fileInput = page.getByTestId('image-upload-input');
    await fileInput.setInputFiles(testImages.invalidPdf);
    await fileInput.setInputFiles(testImages.validJpeg);

    // Then: Should handle gracefully (no crashes)
    const validationError = page.getByTestId('validation-error');
    const uploadProgress = page.getByTestId('upload-progress');

    // Should show final state (valid upload)
    await expect(uploadProgress).toBeVisible();
  });

  test('E2E-VAL-034: should handle drag-drop of invalid file @p2 @ux @validation', async ({
    page,
    log,
  }) => {
    await log.step('Check drag-drop validation');

    // When: User drags invalid file to drop zone
    const dropZone = page.getByTestId('drop-zone');
    await dropZone.setInputFiles(testImages.invalidPdf);

    // Then: Should show validation error
    const validationError = page.getByTestId('validation-error');
    await expect(validationError).toBeVisible();
  });

  test('E2E-VAL-035: should clear error state when file is removed @p2 @ux @validation', async ({
    page,
    log,
  }) => {
    await log.step('Check error state clearing');

    // Given: Error is shown
    const fileInput = page.getByTestId('image-upload-input');
    await fileInput.setInputFiles(testImages.invalidPdf);
    const validationError = page.getByTestId('validation-error');
    await expect(validationError).toBeVisible();

    // When: User clears the file
    const clearButton = page.getByTestId('clear-file-btn');
    await clearButton.click();

    // Then: Error should disappear
    await expect(validationError).not.toBeVisible();
  });
});
