/**
 * Example E2E Test - Image Upload Flow
 *
 * Demonstrates best practices:
 * - Given-When-Then structure
 * - data-testid selectors
 * - Fixture usage
 * - Network interception
 * - Proper assertions
 */

import { test, expect } from '../support/merged-fixtures';

test.describe('Image Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Given: User is on the upload page
    await page.goto('/analyze');
    await expect(page).toHaveTitle(/Image Analyzer/);
  });

  test('should allow uploading a valid image', async ({
    page,
    interceptNetworkCall,
    log,
  }) => {
    await log.step('Upload a valid image file');

    // Intercept upload API call
    const uploadCall = interceptNetworkCall({
      url: '**/api/upload',
    });

    // When: User uploads a valid image
    const fileInput = page.getByTestId('image-upload-input');
    await fileInput.setInputFiles({
      name: 'test-image.jpg',
      mimeType: 'image/jpeg',
      path: './tests/fixtures/images/sample.jpg',
    });

    // Then: Upload progress should be shown
    const progressBar = page.getByTestId('upload-progress');
    await expect(progressBar).toBeVisible();

    // And: Upload should complete successfully
    await uploadCall;
    await expect(progressBar).not.toBeVisible();

    // And: Analysis should start automatically
    const analysisSection = page.getByTestId('analysis-section');
    await expect(analysisSection).toBeVisible();
  });

  test('should show error for invalid file type', async ({
    page,
    log,
  }) => {
    await log.step('Try uploading an invalid file type');

    // When: User tries to upload a non-image file
    const fileInput = page.getByTestId('image-upload-input');
    await fileInput.setInputFiles({
      name: 'document.pdf',
      mimeType: 'application/pdf',
      path: './tests/fixtures/images/document.pdf',
    });

    // Then: Error message should be displayed
    const errorMessage = page.getByTestId('upload-error');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Invalid file type');
  });

  test('should show error for file too large', async ({
    page,
    log,
  }) => {
    await log.step('Try uploading a file larger than limit');

    // When: User uploads a file exceeding size limit (10MB)
    const fileInput = page.getByTestId('image-upload-input');
    await fileInput.setInputFiles({
      name: 'large-image.jpg',
      mimeType: 'image/jpeg',
      path: './tests/fixtures/images/large-image.jpg',
    });

    // Then: Size error should be displayed
    const errorMessage = page.getByTestId('upload-error');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('File too large');
  });

  test('should support drag and drop upload', async ({
    page,
    interceptNetworkCall,
    log,
  }) => {
    await log.step('Upload via drag and drop');

    // Intercept upload API
    const uploadCall = interceptNetworkCall({
      url: '**/api/upload',
    });

    // When: User drags and drops an image
    const dropZone = page.getByTestId('drop-zone');
    await dropZone.setInputFiles({
      name: 'drag-drop-image.jpg',
      mimeType: 'image/jpeg',
      path: './tests/fixtures/images/sample.jpg',
    });

    // Then: Upload should complete
    await uploadCall;
    await expect(page.getByTestId('analysis-section')).toBeVisible();
  });
});

test.describe('Analysis Results', () => {
  test.use({
    // Configure auth for this test suite
    authOptions: {
      userIdentifier: 'test-user',
    },
  });

  test('should display analysis results correctly', async ({
    page,
    testUser,
    log,
  }) => {
    await log.step('Navigate to analysis results');

    // Given: Analysis is complete
    // (In real test, would create analysis via API first)
    await page.goto('/analyze/results/test-analysis-id');

    // When: Page loads
    await expect(page.getByTestId('results-header')).toBeVisible();

    // Then: Results should be displayed
    const styleCard = page.getByTestId('style-result');
    await expect(styleCard).toBeVisible();

    // And: Style confidence should be shown
    const confidenceBadge = styleCard.getByTestId('confidence-badge');
    await expect(confidenceBadge).toContainText(/%/);
  });

  test('should allow saving results as template', async ({
    page,
    log,
  }) => {
    await log.step('Save analysis as template');

    // Given: Analysis is complete
    await page.goto('/analyze/results/test-analysis-id');

    // When: User clicks save as template
    const saveButton = page.getByTestId('save-template-btn');
    await saveButton.click();

    // Then: Template modal should open
    const templateModal = page.getByTestId('template-modal');
    await expect(templateModal).toBeVisible();
  });
});
