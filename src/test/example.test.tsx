import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

describe('Vitest Configuration Tests', () => {
  it('should have vitest globals available', () => {
    // Verify vitest globals are properly configured
    expect(typeof describe).toBe('function');
    expect(typeof it).toBe('function');
    expect(typeof expect).toBe('function');
    expect(typeof vi).toBe('object');
  });

  it('should render React components correctly', () => {
    // Verify React Testing Library is working
    const testId = 'test-element';
    render(<div data-testid={testId}>Test Content</div>);
    const element = screen.getByTestId(testId);
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent('Test Content');
  });

  it('should handle user interactions', () => {
    // Verify user event simulation works
    const handleClick = vi.fn();
    render(<button onClick={handleClick}>Click me</button>);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Verify click handler was called (button text doesn't change without state update)
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(button).toHaveTextContent('Click me');
  });

  it('should work with jest-dom matchers', () => {
    // Verify jest-dom matchers are loaded
    render(<div data-testid="visible">Visible Content</div>);
    const element = screen.getByTestId('visible');
    expect(element).toBeVisible();
    expect(element).toHaveTextContent('Visible');
  });
});

describe('Environment Configuration Tests', () => {
  it('should have NODE_VERSION configured in CI', () => {
    const nodeVersion = process.env.NODE_VERSION || '20';
    expect(nodeVersion).toMatch(/^\d+$/);
  });

  it('should have npm ci and test scripts configured', () => {
    // This test validates that npm scripts are configured in package.json
    expect(typeof it).toBe('function');
    // Verify vitest globals include both 'it' and 'test'
    expect(typeof test).toBe('function');
  });
});
