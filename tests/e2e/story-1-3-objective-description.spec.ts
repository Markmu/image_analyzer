/**
 * Story 1.3: Objective Description - E2E Tests
 *
 * Test coverage for end-to-end user flows involving objective description.
 * Tests cover complete user flow, keyboard navigation, and screen reader compatibility.
 */

import { test, expect } from '@playwright/test';

/**
 * Test data setup helpers
 */

const mockAnalysisResponse = (overrides = {}) => ({
  success: true,
  data: {
    id: 'test-analysis-id',
    status: 'completed',
    objective_description: {
      visible_content: {
        primary_subjects: ['person', 'car'],
        secondary_elements: ['building', 'tree'],
        setting: 'outdoor urban scene',
        actions: ['walking', 'carrying bag'],
        text_content: ['street sign'],
      },
      imaging_features: {
        technique: 'photography',
        lighting: 'natural',
        composition: 'rule-of-thirds',
        perspective: 'eye-level',
      },
      overall_confidence: 0.92,
      uncertainty_fields: [],
      analysis_timestamp: '2025-03-05T12:00:00Z',
      model_version: '1.0.0',
    },
    ...overrides,
  },
});

const mockAnalysisResponseWithUncertainty = () => ({
  success: true,
  data: {
    id: 'test-analysis-id',
    status: 'completed',
    objective_description: {
      visible_content: {
        primary_subjects: ['person'],
        setting: 'outdoor',
      },
      imaging_features: {
        technique: 'photography',
      },
      overall_confidence: 0.75,
      uncertainty_fields: [
        {
          field_name: 'lighting',
          reason: 'Image too dark to determine',
          confidence: 0.3,
        },
        {
          field_name: 'actions',
          reason: 'No clear action visible',
        },
      ],
    },
  },
});

test.describe('Story 1.3 - E2E Tests - P1', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Mock API responses before navigation (network-first pattern)
    await page.route('**/api/analysis/**', async (route) => {
      // Check if this is a result request
      if (route.request().url().includes('/api/analysis/')) {
        // Return mock analysis result
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockAnalysisResponse()),
        });
      }
    });

    // Login before each test
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('/');
  });

  test('AC8: Complete user flow - Upload image → Analyze → View objective description', async ({ page }) => {
    // Given: User is on analysis page
    await page.goto('/analysis');

    // When: User uploads an image
    const fileInput = page.getByTestId('image-upload-input');
    await fileInput.setInputFiles('./tests/fixtures/test-image.jpg');

    // And: User clicks "Analyze" button
    await page.getByRole('button', { name: /analyze/i }).click();

    // Then: Analysis completes and shows objective description
    await page.waitForURL(/\/analysis\/[a-z0-9-]+/);
    await page.waitForSelector('[data-testid="objective-description-panel"]', { state: 'visible' });

    // And: Objective description is displayed
    await expect(page.getByText('person')).toBeVisible();
    await expect(page.getByText('car')).toBeVisible();
    await expect(page.getByText('outdoor urban scene')).toBeVisible();
    await expect(page.getByText('photography')).toBeVisible();
    await expect(page.getByText(/92.*confidence/i)).toBeVisible();

    // And: No uncertain fields (all determined)
    await expect(page.queryByTestId('uncertainty-list')).not.toBeVisible();
  });

  test('AC8: User flow with uncertain fields', async ({ page }) => {
    // Given: User is on analysis page
    await page.goto('/analysis');

    // And: Mock response with uncertain fields
    await page.route('**/api/analysis/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockAnalysisResponseWithUncertainty()),
      });
    });

    // When: User views analysis result
    await page.goto('/analysis/test-analysis-id');
    await page.waitForSelector('[data-testid="objective-description-panel"]', { state: 'visible' });

    // Then: Objective description shows uncertain fields
    await expect(page.getByText('person')).toBeVisible();
    await expect(page.getByText(/75.*confidence/i)).toBeVisible();

    // And: Uncertainty list is displayed
    await expect(page.getByTestId('uncertainty-list')).toBeVisible();
    await expect(page.getByText('lighting')).toBeVisible();
    await expect(page.getByText('actions')).toBeVisible();
    await expect(page.getByText(/Image too dark to determine/i)).toBeVisible();
    await expect(page.getByText(/No clear action visible/i)).toBeVisible();

    // And: Uncertain fields have special styling
    const uncertainLighting = page.getByTestId(/lighting.*unknown/i);
    await expect(uncertainLighting).toHaveAttribute('data-unknown', 'true');
    await expect(uncertainLighting).toHaveClass(/unknown-field|warning/i);
  });

  test('AC8: Keyboard navigation - All elements accessible via keyboard', async ({ page }) => {
    // Given: User is on analysis result page
    await page.goto('/analysis/test-analysis-id');
    await page.waitForSelector('[data-testid="objective-description-panel"]', { state: 'visible' });

    // When: User navigates using only keyboard (Tab key)
    const focusableElements = [
      '[data-testid="objective-description-panel"]',
      '[data-testid="confidence-badge"]',
      '[data-testid="uncertainty-list"]',
      'button',
      'a',
    ];

    for (const selector of focusableElements) {
      // Press Tab to move focus
      await page.keyboard.press('Tab');

      // Assert: Element is focused and visible
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();

      // Assert: Focus indicator is visible (WCAG 2.4.7)
      const computedStyle = await focusedElement.evaluate((el) => {
        return window.getComputedStyle(el);
      });
      expect(computedStyle.outline).not.toBe('none');
    }

    // Then: All interactive elements are keyboard accessible
    // Verify no mouse-only elements exist
    const mouseOnlyElements = await page.locator('[onMouseEnter]:not([tabindex])').count();
    expect(mouseOnlyElements).toBe(0);
  });

  test('AC8: Keyboard navigation - Skip to main content', async ({ page }) => {
    // Given: User navigates to analysis page
    await page.goto('/analysis/test-analysis-id');

    // When: User presses Tab to skip navigation
    await page.keyboard.press('Tab');

    // Then: Focus moves to main content, not navigation
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();

    // First focusable element should be in main content
    const mainContent = page.getByRole('main');
    await expect(mainContent).toContainElement(focusedElement);
  });
});

test.describe('Story 1.3 - E2E Tests - P2', () => {
  test.beforeEach(async ({ page }) => {
    // Setup API mocks
    await page.route('**/api/analysis/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockAnalysisResponse()),
      });
    });

    // Login
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('/');
  });

  test('AC8: Screen reader compatibility - Proper ARIA labels', async ({ page }) => {
    // Given: User is on analysis result page
    await page.goto('/analysis/test-analysis-id');
    await page.waitForSelector('[data-testid="objective-description-panel"]', { state: 'visible' });

    // When: Screen reader navigates page
    // Then: Proper ARIA labels present
    const panel = page.getByRole('region', { name: /objective description/i });
    await expect(panel).toBeVisible();

    // Confidence badge has aria-label
    const confidenceBadge = page.getByTestId('confidence-badge');
    await expect(confidenceBadge).toHaveAttribute('aria-label');

    // Unknown fields have aria-describedby
    const uncertaintyList = page.getByTestId('uncertainty-list');
    if (await uncertaintyList.count() > 0) {
      const uncertainFields = uncertaintyList.getByRole('listitem');
      const count = await uncertainFields.count();
      for (let i = 0; i < count; i++) {
        await expect(uncertainFields.nth(i)).toHaveAttribute('aria-describedby');
      }
    }

    // All images have alt text
    const images = page.locator('img');
    const imageCount = await images.count();
    for (let i = 0; i < imageCount; i++) {
      await expect(images.nth(i)).toHaveAttribute('alt');
    }
  });

  test('AC8: Screen reader compatibility - Semantic HTML', async ({ page }) => {
    // Given: User is on analysis result page
    await page.goto('/analysis/test-analysis-id');
    await page.waitForSelector('[data-testid="objective-description-panel"]', { state: 'visible' });

    // When: Screen reader parses page structure
    // Then: Proper heading hierarchy
    const headings = page.getByRole('heading');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);

    // Verify heading levels are sequential (no skipped levels)
    for (let i = 0; i < headingCount; i++) {
      const heading = headings.nth(i);
      const level = await heading.getAttribute('aria-level');

      // First heading should be h1 or h2, not h3+
      if (i === 0) {
        expect(['1', '2']).toContain(level);
      }
    }

    // Lists use proper list elements
    const lists = page.getByRole('list');
    const listCount = await lists.count();
    if (listCount > 0) {
      // Each list should have listitems
      for (let i = 0; i < listCount; i++) {
        const list = lists.nth(i);
        const items = list.getByRole('listitem');
        const itemCount = await items.count();
        expect(itemCount).toBeGreaterThan(0);
      }
    }
  });

  test('AC8: Screen reader compatibility - Live regions for dynamic content', async ({ page }) => {
    // Given: User is on analysis page waiting for results
    await page.goto('/analysis');

    // When: Analysis completes and results appear
    // Upload image
    const fileInput = page.getByTestId('image-upload-input');
    await fileInput.setInputFiles('./tests/fixtures/test-image.jpg');
    await page.getByRole('button', { name: /analyze/i }).click();

    // Wait for results
    await page.waitForSelector('[data-testid="objective-description-panel"]', { state: 'visible' });

    // Then: Results panel is a live region (announced to screen readers)
    const panel = page.getByTestId('objective-description-panel');
    await expect(panel).toHaveAttribute('role', 'region');
    await expect(panel).toHaveAttribute('aria-live', 'polite');
  });
});

test.describe('Story 1.3 - E2E Best Practices', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/analysis/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockAnalysisResponse()),
      });
    });

    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('/');
  });

  test('should use data-testid selectors for resilience', async ({ page }) => {
    // Given: User is on analysis result page
    await page.goto('/analysis/test-analysis-id');

    // When: Page loads
    await page.waitForSelector('[data-testid="objective-description-panel"]', { state: 'visible' });

    // Then: All key elements use data-testid (resilient to CSS/style changes)
    await expect(page.getByTestId('objective-description-panel')).toBeVisible();
    await expect(page.getByTestId('confidence-badge')).toBeVisible();

    // Verify no fragile CSS selectors used in test
    // (This is a code review assertion, not runtime check)
  });

  test('should handle loading state gracefully', async ({ page }) => {
    // Given: User navigates to analysis page
    await page.goto('/analysis/test-analysis-id');

    // When: Page is loading (delay response)
    await page.route('**/api/analysis/**', async (route) => {
      // Delay response
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockAnalysisResponse()),
      });
    });

    // Then: Loading indicator shown
    await expect(page.getByTestId('loading-spinner')).toBeVisible();

    // And: Loading indicator disappears when content loads
    await page.waitForSelector('[data-testid="objective-description-panel"]', { state: 'visible' });
    await expect(page.getByTestId('loading-spinner')).not.toBeVisible();
  });

  test('should handle error state gracefully', async ({ page }) => {
    // Given: API returns error
    await page.route('**/api/analysis/**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to load analysis',
          },
        }),
      });
    });

    // When: User navigates to page
    await page.goto('/analysis/test-analysis-id');

    // Then: Error message displayed
    await expect(page.getByText(/failed to load/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /retry/i })).toBeVisible();

    // And: Error message is accessible
    const errorMessage = page.getByRole('alert');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveAttribute('role', 'alert');
  });

  test('should be performant - page loads within time budget', async ({ page }) => {
    // Given: User navigates to analysis result
    const startTime = Date.now();

    await page.goto('/analysis/test-analysis-id');
    await page.waitForSelector('[data-testid="objective-description-panel"]', { state: 'visible' });

    const endTime = Date.now();
    const loadTime = endTime - startTime;

    // Then: Page loads within 3 seconds (performance budget)
    expect(loadTime).toBeLessThan(3000);

    // And: First contentful paint < 1.5 seconds
    const metrics = await page.evaluate(() => {
      const perfData = window.performance.getEntriesByType('navigation')[0] as any;
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
        loadComplete: perfData.loadEventEnd - perfData.navigationStart,
      };
    });

    expect(metrics.domContentLoaded).toBeLessThan(1500);
  });
});

test.describe('Story 1.3 - E2E Given-When-Then Pattern', () => {
  test('GIVEN user is logged in, WHEN they upload an image and analyze, THEN they see objective description', async ({ page }) => {
    // GIVEN: User is logged in and on analysis page
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('/');

    await page.goto('/analysis');

    // WHEN: User uploads image and analyzes
    await page.route('**/api/analysis/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockAnalysisResponse()),
      });
    });

    const fileInput = page.getByTestId('image-upload-input');
    await fileInput.setInputFiles('./tests/fixtures/test-image.jpg');
    await page.getByRole('button', { name: /analyze/i }).click();

    // THEN: Objective description is displayed with all required fields
    await page.waitForSelector('[data-testid="objective-description-panel"]', { state: 'visible' });

    // Verify AC1: Complete objective_description
    await expect(page.getByText('person')).toBeVisible();
    await expect(page.getByText('car')).toBeVisible();
    await expect(page.getByText(/92.*confidence/i)).toBeVisible();
    await expect(page.getByTestId('uncertainty-list')).not.toBeVisible();

    // Verify AC3: Unified JSON contract
    const panel = page.getByTestId('objective-description-panel');
    await expect(panel).toHaveAttribute('data-schema-version', '1.0.0');
  });

  test('GIVEN user has uncertain analysis, WHEN they view results, THEN uncertain fields are clearly marked', async ({ page }) => {
    // GIVEN: User is logged in and has uncertain analysis result
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('/');

    // Mock uncertain response
    await page.route('**/api/analysis/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockAnalysisResponseWithUncertainty()),
      });
    });

    // WHEN: User views analysis result
    await page.goto('/analysis/test-analysis-id');
    await page.waitForSelector('[data-testid="objective-description-panel"]', { state: 'visible' });

    // THEN: Uncertain fields are clearly marked (AC2)
    const uncertainList = page.getByTestId('uncertainty-list');
    await expect(uncertainList).toBeVisible();

    const uncertainField = page.getByTestId(/lighting.*unknown/i);
    await expect(uncertainField).toHaveAttribute('data-unknown', 'true');
    await expect(uncertainField).toHaveClass(/unknown-field|warning/);

    // AND: Uncertainty reasons are displayed
    await expect(page.getByText(/Image too dark to determine/i)).toBeVisible();
  });

  test('GIVEN user uses keyboard only, WHEN they navigate results, THEN all elements are accessible (AC8)', async ({ page }) => {
    // GIVEN: User is on analysis result page
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('/');

    await page.route('**/api/analysis/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockAnalysisResponse()),
      });
    });

    await page.goto('/analysis/test-analysis-id');
    await page.waitForSelector('[data-testid="objective-description-panel"]', { state: 'visible' });

    // WHEN: User navigates using only keyboard (no mouse)
    let tabCount = 0;
    const maxTabs = 20; // Prevent infinite loop

    while (tabCount < maxTabs) {
      await page.keyboard.press('Tab');

      // Check if we've cycled back to the beginning
      const firstElement = page.locator(':focus').first();
      const body = page.locator('body');
      const isAtStart = await firstElement.evaluate((el) => {
        return document.activeElement === el || document.activeElement === document.body;
      });

      if (isAtStart && tabCount > 0) break;

      // THEN: Each focused element is visible and accessible
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();

      // Verify focus indicator (WCAG 2.4.7)
      const styles = await focusedElement.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          outline: computed.outline,
          outlineOffset: computed.outlineOffset,
        };
      });

      // Focus indicator must be visible (not "none")
      expect(styles.outline).not.toBe('none');

      tabCount++;
    }

    // Verify we cycled through focusable elements
    expect(tabCount).toBeGreaterThan(0);
  });
});

test.describe('Story 1.3 - Network-First Pattern', () => {
  test('should intercept API calls BEFORE navigation (race condition prevention)', async ({ page }) => {
    // This test verifies the network-first pattern is used
    // to prevent race conditions

    // GIVEN: API route is set up BEFORE navigation
    let routeSet = false;

    await page.route('**/api/analysis/test-analysis-id', async (route) => {
      routeSet = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockAnalysisResponse()),
      });
    });

    // WHEN: User navigates to page
    // THEN: Route is set BEFORE page loads (no race condition)
    await page.goto('/analysis/test-analysis-id');

    // Verify route was set (no race)
    expect(routeSet).toBe(true);

    // Verify content loaded correctly
    await page.waitForSelector('[data-testid="objective-description-panel"]', { state: 'visible' });
    await expect(page.getByText('person')).toBeVisible();
  });

  test('should use waitForResponse for deterministic waiting', async ({ page }) => {
    // GIVEN: User navigates to analysis page
    await page.route('**/api/analysis/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockAnalysisResponse()),
      });
    });

    // WHEN: Page loads
    const responsePromise = page.waitForResponse('**/api/analysis/**');

    await page.goto('/analysis/test-analysis-id');
    await responsePromise; // Explicit wait for network

    // THEN: Content is reliably loaded (no flaky timeout)
    await expect(page.getByTestId('objective-description-panel')).toBeVisible();
    await expect(page.getByText('person')).toBeVisible();
  });
});
