/**
 * CopyButton Component Tests
 *
 * Epic 5 - Story 5.1: Template Generation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCopyToClipboard } from './useCopyToClipboard';

// Mock navigator.clipboard
const mockClipboard = {
  writeText: vi.fn(),
};

Object.assign(navigator, {
  clipboard: mockClipboard,
});

// Mock document.execCommand for fallback
const mockExecCommand = vi.fn();
Object.assign(document, {
  execCommand: mockExecCommand,
});

// Mock secure context
Object.assign(window, {
  isSecureContext: true,
});

describe('useCopyToClipboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to secure context by default
    Object.assign(window, {
      isSecureContext: true,
    });
  });

  it('should copy text to clipboard successfully', async () => {
    const { result } = renderHook(() => useCopyToClipboard());
    const testText = 'Test text to copy';

    mockClipboard.writeText.mockResolvedValue(undefined);

    let success = false;
    await act(async () => {
      success = await result.current.copy(testText);
    });

    expect(success).toBe(true);
    expect(mockClipboard.writeText).toHaveBeenCalledWith(testText);
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it('should handle copy errors', async () => {
    const { result } = renderHook(() => useCopyToClipboard());
    const testError = new Error('Copy failed');

    mockClipboard.writeText.mockRejectedValue(testError);

    let success = false;
    await act(async () => {
      success = await result.current.copy('test');
    });

    expect(success).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.error).toBe(testError);
  });

  it('should call onCopySuccess callback', async () => {
    const onSuccess = vi.fn();
    const { result } = renderHook(() =>
      useCopyToClipboard({ onCopySuccess: onSuccess })
    );

    mockClipboard.writeText.mockResolvedValue(undefined);

    await act(async () => {
      await result.current.copy('test text');
    });

    expect(onSuccess).toHaveBeenCalledWith('test text');
  });

  it('should call onCopyError callback', async () => {
    const onError = vi.fn();
    const testError = new Error('Copy failed');

    const { result } = renderHook(() =>
      useCopyToClipboard({ onCopyError: onError })
    );

    mockClipboard.writeText.mockRejectedValue(testError);

    await act(async () => {
      await result.current.copy('test');
    });

    expect(onError).toHaveBeenCalledWith(testError);
  });

  it('should reset success state after duration', async () => {
    vi.useFakeTimers();
    const successDuration = 1000;

    const { result } = renderHook(() =>
      useCopyToClipboard({ successDuration })
    );

    mockClipboard.writeText.mockResolvedValue(undefined);

    await act(async () => {
      await result.current.copy('test');
    });

    expect(result.current.isSuccess).toBe(true);

    act(() => {
      vi.advanceTimersByTime(successDuration);
    });

    expect(result.current.isSuccess).toBe(false);

    vi.useRealTimers();
  });

  it('should use fallback when clipboard API is unavailable', async () => {
    // Simulate non-secure context
    Object.assign(window, {
      isSecureContext: false,
    });

    mockExecCommand.mockReturnValue(true);

    const { result } = renderHook(() => useCopyToClipboard());

    let success = false;
    await act(async () => {
      success = await result.current.copy('test text');
    });

    expect(success).toBe(true);
    expect(mockExecCommand).toHaveBeenCalledWith('copy');
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.error).toBe(null);
  });
});
