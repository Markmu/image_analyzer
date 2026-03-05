/**
 * ObjectiveDescriptionPanel Component Tests
 *
 * Story 1.3: 生成完整结构化客观描述结果
 *
 * Test coverage for the ObjectiveDescriptionPanel component.
 * Tests cover field distinction, uncertainty list display, and accessibility.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ObjectiveDescriptionPanel } from '../ObjectiveDescriptionPanel';

/**
 * Test data factories
 */

const createMockObjectiveDescription = (overrides = {}) => ({
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
  ...overrides,
});

const createMockUncertainFields = () => [
  {
    field_name: 'lighting',
    reason: 'Image too dark to determine lighting condition',
    confidence: 0.3,
  },
  {
    field_name: 'technique',
    reason: 'Cannot distinguish between photo and digital art',
  },
];

describe('ObjectiveDescriptionPanel - P1 Tests', () => {
  describe('AC7: Distinguish between determined and unknown fields', () => {
    it('should display determined fields with normal styling', () => {
      // Arrange: Mock objective description with all fields determined
      const mockDescription = createMockObjectiveDescription();

      // Act: Render component
      render(<ObjectiveDescriptionPanel objectiveDescription={mockDescription} />);

      // Assert: Determined fields are displayed
      expect(screen.getByText('person')).toBeVisible();
      expect(screen.getByText('car')).toBeVisible();
      expect(screen.getByText('outdoor urban scene')).toBeVisible();
      expect(screen.getByText('photography')).toBeVisible();
      expect(screen.getByText('natural')).toBeVisible();

      // Verify determined fields do NOT have unknown styling
      const determinedField = screen.getByText('photography');
      expect(determinedField).not.toHaveClass('unknown-field');
      expect(determinedField).not.toHaveAttribute('data-unknown', 'true');
    });

    it('should display unknown fields with special styling', () => {
      // Arrange: Mock objective description with uncertain fields
      const mockDescription = createMockObjectiveDescription({
        uncertainty_fields: createMockUncertainFields(),
      });

      // Act: Render component
      render(<ObjectiveDescriptionPanel objectiveDescription={mockDescription} />);

      // Assert: Unknown fields are marked with special styling
      const unknownField1 = screen.getByText(/lighting.*unknown/i);
      const unknownField2 = screen.getByText(/technique.*unknown/i);

      expect(unknownField1).toBeVisible();
      expect(unknownField1).toHaveAttribute('data-unknown', 'true');
      expect(unknownField1).toHaveClass('unknown-field');

      expect(unknownField2).toBeVisible();
      expect(unknownField2).toHaveAttribute('data-unknown', 'true');
    });

    it('should show visual distinction between certain and uncertain fields', () => {
      // Arrange: Mix of certain and uncertain fields
      const mockDescription = createMockObjectiveDescription({
        visible_content: {
          primary_subjects: ['person'],
          setting: 'outdoor', // Certain
        },
        uncertainty_fields: [
          {
            field_name: 'lighting',
            reason: 'Too dark',
          },
        ],
      });

      // Act: Render component
      render(<ObjectiveDescriptionPanel objectiveDescription={mockDescription} />);

      // Assert: Visual distinction exists
      const certainField = screen.getByText('outdoor');
      const uncertainField = screen.getByText(/lighting.*unknown/i);

      // Certain field has normal styling
      expect(certainField).not.toHaveAttribute('data-unknown');
      expect(certainField).not.toHaveClass('unknown-field');

      // Unknown field has warning styling
      expect(uncertainField).toHaveAttribute('data-unknown', 'true');
      expect(uncertainField).toHaveClass('unknown-field');
      expect(uncertainField).toHaveClass('warning-badge'); // Visual indicator
    });

    it('should display confidence score for certain fields', () => {
      // Arrange: High confidence description
      const mockDescription = createMockObjectiveDescription({
        overall_confidence: 0.95,
      });

      // Act: Render component
      render(<ObjectiveDescriptionPanel objectiveDescription={mockDescription} />);

      // Assert: Confidence score displayed
      expect(screen.getByText(/95.*confidence/i)).toBeVisible();
      const confidenceBadge = screen.getByTestId('confidence-badge');
      expect(confidenceBadge).toHaveClass('high-confidence');
      expect(confidenceBadge).not.toHaveClass('low-confidence');
    });

    it('should display low confidence warning when many fields are unknown', () => {
      // Arrange: Low confidence description
      const mockDescription = createMockObjectiveDescription({
        overall_confidence: 0.65,
        uncertainty_fields: createMockUncertainFields(),
      });

      // Act: Render component
      render(<ObjectiveDescriptionPanel objectiveDescription={mockDescription} />);

      // Assert: Low confidence warning displayed
      expect(screen.getByText(/65.*confidence/i)).toBeVisible();
      const confidenceBadge = screen.getByTestId('confidence-badge');
      expect(confidenceBadge).toHaveClass('low-confidence');

      // Warning message about uncertain fields
      expect(screen.getByText(/some fields could not be determined/i)).toBeVisible();
    });
  });

  describe('AC7: Uncertainty list display', () => {
    it('should display list of uncertain fields', () => {
      // Arrange: Description with uncertain fields
      const mockDescription = createMockObjectiveDescription({
        uncertainty_fields: createMockUncertainFields(),
      });

      // Act: Render component
      render(<ObjectiveDescriptionPanel objectiveDescription={mockDescription} />);

      // Assert: Uncertainty list section visible
      expect(screen.getByText('Uncertain Fields')).toBeVisible();

      // All uncertain fields listed
      expect(screen.getByText('lighting')).toBeVisible();
      expect(screen.getByText('technique')).toBeVisible();

      // Reasons displayed
      expect(screen.getByText('Image too dark to determine lighting condition')).toBeVisible();
      expect(screen.getByText('Cannot distinguish between photo and digital art')).toBeVisible();
    });

    it('should show "No uncertain fields" when all fields are determined', () => {
      // Arrange: Description with no uncertain fields
      const mockDescription = createMockObjectiveDescription({
        uncertainty_fields: [],
      });

      // Act: Render component
      render(<ObjectiveDescriptionPanel objectiveDescription={mockDescription} />);

      // Assert: No uncertainty list shown
      expect(screen.queryByText('Uncertain Fields')).not.toBeInTheDocument();

      // Optional: Success message
      expect(screen.getByText(/all fields determined/i)).toBeVisible();
    });

    it('should be readable when uncertainty_fields list is long', () => {
      // Arrange: Many uncertain fields
      const mockDescription = createMockObjectiveDescription({
        uncertainty_fields: [
          { field_name: 'lighting', reason: 'Reason 1' },
          { field_name: 'technique', reason: 'Reason 2' },
          { field_name: 'composition', reason: 'Reason 3' },
          { field_name: 'perspective', reason: 'Reason 4' },
          { field_name: 'actions', reason: 'Reason 5' },
        ],
      });

      // Act: Render component
      render(<ObjectiveDescriptionPanel objectiveDescription={mockDescription} />);

      // Assert: All fields visible and readable
      expect(screen.getByText('lighting')).toBeVisible();
      expect(screen.getByText('technique')).toBeVisible();
      expect(screen.getByText('composition')).toBeVisible();
      expect(screen.getByText('perspective')).toBeVisible();
      expect(screen.getByText('actions')).toBeVisible();

      // List is scrollable or collapsible
      const uncertaintyList = screen.getByTestId('uncertainty-list');
      expect(uncertaintyList).toHaveClass('scrollable');
    });
  });
});

describe('ObjectiveDescriptionPanel - P2 Tests', () => {
  describe('AC8: WCAG 2.1 AA Accessibility', () => {
    it('should have proper ARIA labels for screen readers', () => {
      // Arrange: Mock description
      const mockDescription = createMockObjectiveDescription();

      // Act: Render component
      render(<ObjectiveDescriptionPanel objectiveDescription={mockDescription} />);

      // Assert: Proper ARIA labels
      const panel = screen.getByRole('region', { name: /objective description/i });
      expect(panel).toBeVisible();

      // Confidence badge has aria-label
      const confidenceBadge = screen.getByTestId('confidence-badge');
      expect(confidenceBadge).toHaveAttribute('aria-label', expect.stringMatching(/confidence.*92%/i));

      // Unknown fields have aria-describedby
      const unknownField = screen.queryByRole('listitem', { name: /lighting/i });
      if (unknownField) {
        expect(unknownField).toHaveAttribute('aria-describedby', 'uncertainty-reason');
      }
    });

    it('should support keyboard navigation', async () => {
      // Arrange: Render component with interactive elements
      const mockDescription = createMockObjectiveDescription({
        uncertainty_fields: createMockUncertainFields(),
      });

      // Act: Render and navigate with keyboard
      render(<ObjectiveDescriptionPanel objectiveDescription={mockDescription} />);

      const user = userEvent.setup();

      // Tab through interactive elements
      await user.tab();

      // First element should be focusable
      const focusableElement = document.activeElement;
      expect(focusableElement).not.toBe(document.body);

      // All interactive elements should be focusable via keyboard
      const interactiveElements = screen.getAllByRole('button');
      for (const element of interactiveElements) {
        await user.tab();
        expect(document.activeElement).toBeVisible();
      }
    });

    it('should have sufficient color contrast for unknown fields', () => {
      // Arrange: Description with unknown fields
      const mockDescription = createMockObjectiveDescription({
        uncertainty_fields: createMockUncertainFields(),
      });

      // Act: Render component
      render(<ObjectiveDescriptionPanel objectiveDescription={mockDescription} />);

      // Assert: Unknown fields have proper contrast
      const unknownField = screen.getByTestId(/lighting.*unknown/i);
      expect(unknownField).toHaveStyle({
        backgroundColor: expect.stringMatching(/fff|ffe|fff4/), // Warning color
        color: expect.stringMatching(/000|333|1a1a/), // Dark text
      });
    });

    it('should have semantic HTML structure', () => {
      // Arrange: Mock description
      const mockDescription = createMockObjectiveDescription();

      // Act: Render component
      render(<ObjectiveDescriptionPanel objectiveDescription={mockDescription} />);

      // Assert: Semantic HTML elements used
      expect(screen.getByRole('region', { name: /objective description/i })).toBeVisible();

      // Content in proper heading hierarchy
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);

      // Lists use proper list elements
      const list = screen.queryByRole('list');
      if (list) {
        expect(list).toBeVisible();
      }
    });
  });
});

describe('ObjectiveDescriptionPanel - Component Best Practices', () => {
  it('should handle null or undefined objectiveDescription gracefully', () => {
    // Arrange: No description provided
    // @ts-expect-error - Testing null handling
    render(<ObjectiveDescriptionPanel objectiveDescription={null} />);

    // Assert: Shows loading or empty state
    expect(screen.getByText(/loading|no description/i)).toBeVisible();
  });

  it('should handle empty objective_description', () => {
    // Arrange: Empty description
    const mockDescription = {
      visible_content: {},
      overall_confidence: 0,
      uncertainty_fields: [],
    };

    // Act: Render component
    render(<ObjectiveDescriptionPanel objectiveDescription={mockDescription} />);

    // Assert: Does not crash, shows empty state
    expect(screen.getByText(/no content available/i)).toBeVisible();
  });

  it('should display imaging_features when present', () => {
    // Arrange: Description with imaging features
    const mockDescription = createMockObjectiveDescription({
      imaging_features: {
        technique: 'photography',
        lighting: 'natural',
        composition: 'centered',
        perspective: 'eye-level',
      },
    });

    // Act: Render component
    render(<ObjectiveDescriptionPanel objectiveDescription={mockDescription} />);

    // Assert: Imaging features displayed
    expect(screen.getByText(/imaging features/i)).toBeVisible();
    expect(screen.getByText('photography')).toBeVisible();
    expect(screen.getByText('natural')).toBeVisible();
    expect(screen.getByText('centered')).toBeVisible();
    expect(screen.getByText('eye-level')).toBeVisible();
  });

  it('should handle missing imaging_features gracefully', () => {
    // Arrange: Description without imaging features
    const mockDescription = createMockObjectiveDescription({
      imaging_features: undefined, // Optional field missing
    });

    // Act: Render component
    render(<ObjectiveDescriptionPanel objectiveDescription={mockDescription} />);

    // Assert: Imaging features section not shown
    expect(screen.queryByText(/imaging features/i)).not.toBeInTheDocument();
  });

  it('should display analysis metadata', () => {
    // Arrange: Description with metadata
    const mockDescription = createMockObjectiveDescription({
      analysis_timestamp: '2025-03-05T12:00:00Z',
      model_version: '1.0.0',
    });

    // Act: Render component
    render(<ObjectiveDescriptionPanel objectiveDescription={mockDescription} />);

    // Assert: Metadata displayed
    expect(screen.getByText(/2025-03-05/i)).toBeVisible();
    expect(screen.getByText(/model.*1.0.0/i)).toBeVisible();
  });

  it('should be performant with large descriptions', () => {
    // Arrange: Large description
    const largeDescription = createMockObjectiveDescription({
      visible_content: {
        primary_subjects: Array(100).fill('person'), // Large array
        secondary_elements: Array(100).fill('object'),
        actions: Array(50).fill('action'),
      },
      uncertainty_fields: Array(20).fill(null).map((_, i) => ({
        field_name: `field_${i}`,
        reason: `Reason ${i}`,
      })),
    });

    // Act: Render component
    const startTime = performance.now();
    render(<ObjectiveDescriptionPanel objectiveDescription={largeDescription} />);
    const endTime = performance.now();

    // Assert: Renders in reasonable time (< 100ms)
    expect(endTime - startTime).toBeLessThan(100);
  });
});
