/**
 * useToast Hook Tests
 *
 * Epic 5 - Story 5.3: Template Editor
 * Task 8: Unit tests for useToast hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from './useToast';

describe('useToast Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should return toast functions', () => {
      const { result } = renderHook(() => useToast());

      expect(result.current.showSuccess).toBeDefined();
      expect(result.current.showError).toBeDefined();
      expect(result.current.showInfo).toBeDefined();
      expect(result.current.showWarning).toBeDefined();
    });

    it('should return functions that are callable', () => {
      const { result } = renderHook(() => useToast());

      expect(typeof result.current.showSuccess).toBe('function');
      expect(typeof result.current.showError).toBe('function');
      expect(typeof result.current.showInfo).toBe('function');
      expect(typeof result.current.showWarning).toBe('function');
    });
  });

  describe('Toast Functions', () => {
    it('should call showSuccess without errors', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showSuccess('Success message');
      });

      // showSuccess doesn't log to console, just check it doesn't throw
      expect(true).toBe(true);
    });

    it('should call showError without errors', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showError('Error message');
      });

      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });

    it('should call showInfo without errors', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showInfo('Info message');
      });

      // showInfo doesn't log to console, just check it doesn't throw
      expect(true).toBe(true);
    });

    it('should call showWarning without errors', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.showWarning('Warning message');
      });

      expect(warnSpy).toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });
});
