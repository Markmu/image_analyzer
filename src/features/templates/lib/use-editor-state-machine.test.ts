/**
 * Editor State Machine Hook Tests
 *
 * Tests for useEditorStateMachine hook
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEditorStateMachine, type EditorEvent } from './use-editor-state-machine';

describe('useEditorStateMachine', () => {
  it('should initialize with idle state', () => {
    const { result } = renderHook(() => useEditorStateMachine());

    expect(result.current.state).toBe('idle');
    expect(result.current.isEditorExpanded).toBe(false);
    expect(result.current.isGenerating).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.isSuccess).toBe(false);
  });

  it('should transition from idle to editing on OPEN_EDITOR', () => {
    const { result } = renderHook(() => useEditorStateMachine());

    act(() => {
      result.current.transition({ type: 'OPEN_EDITOR' });
    });

    expect(result.current.state).toBe('editing');
    expect(result.current.isEditorExpanded).toBe(true);
  });

  it('should transition from idle to generating on START_GENERATE', () => {
    const { result } = renderHook(() => useEditorStateMachine());

    act(() => {
      result.current.transition({ type: 'START_GENERATE' });
    });

    expect(result.current.state).toBe('generating');
    expect(result.current.isGenerating).toBe(true);
  });

  it('should transition from editing to idle on CONFIRM_EDIT', () => {
    const { result } = renderHook(() => useEditorStateMachine());

    act(() => {
      result.current.transition({ type: 'OPEN_EDITOR' });
    });

    expect(result.current.state).toBe('editing');

    act(() => {
      result.current.transition({ type: 'CONFIRM_EDIT' });
    });

    expect(result.current.state).toBe('idle');
    expect(result.current.isEditorExpanded).toBe(false);
  });

  it('should transition from editing to idle on CANCEL_EDIT', () => {
    const { result } = renderHook(() => useEditorStateMachine());

    act(() => {
      result.current.transition({ type: 'OPEN_EDITOR' });
    });

    expect(result.current.state).toBe('editing');

    act(() => {
      result.current.transition({ type: 'CANCEL_EDIT' });
    });

    expect(result.current.state).toBe('idle');
    expect(result.current.isEditorExpanded).toBe(false);
  });

  it('should transition from generating to success on GENERATE_SUCCESS', () => {
    const { result } = renderHook(() => useEditorStateMachine());

    act(() => {
      result.current.transition({ type: 'START_GENERATE' });
    });

    expect(result.current.state).toBe('generating');

    act(() => {
      result.current.transition({ type: 'GENERATE_SUCCESS' });
    });

    expect(result.current.state).toBe('success');
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isGenerating).toBe(false);
  });

  it('should transition from generating to error on GENERATE_ERROR', () => {
    const { result } = renderHook(() => useEditorStateMachine());

    act(() => {
      result.current.transition({ type: 'START_GENERATE' });
    });

    expect(result.current.state).toBe('generating');

    act(() => {
      result.current.transition({ type: 'GENERATE_ERROR', error: 'API failed' });
    });

    expect(result.current.state).toBe('error');
    expect(result.current.isError).toBe(true);
    expect(result.current.error).toBe('API failed');
    expect(result.current.isGenerating).toBe(false);
  });

  it('should clear error on non-error state transitions', () => {
    const { result } = renderHook(() => useEditorStateMachine());

    act(() => {
      result.current.transition({ type: 'START_GENERATE' });
      result.current.transition({ type: 'GENERATE_ERROR', error: 'API failed' });
    });

    expect(result.current.error).toBe('API failed');

    act(() => {
      result.current.transition({ type: 'OPEN_EDITOR' });
    });

    expect(result.current.state).toBe('editing');
    expect(result.current.error).toBeNull();
  });

  it('should transition from success to editing on OPEN_EDITOR', () => {
    const { result } = renderHook(() => useEditorStateMachine());

    act(() => {
      result.current.transition({ type: 'START_GENERATE' });
      result.current.transition({ type: 'GENERATE_SUCCESS' });
    });

    expect(result.current.state).toBe('success');

    act(() => {
      result.current.transition({ type: 'OPEN_EDITOR' });
    });

    expect(result.current.state).toBe('editing');
  });

  it('should transition from error to generating on START_GENERATE', () => {
    const { result } = renderHook(() => useEditorStateMachine());

    act(() => {
      result.current.transition({ type: 'START_GENERATE' });
      result.current.transition({ type: 'GENERATE_ERROR', error: 'API failed' });
    });

    expect(result.current.state).toBe('error');

    act(() => {
      result.current.transition({ type: 'START_GENERATE' });
    });

    expect(result.current.state).toBe('generating');
    expect(result.current.error).toBeNull();
  });

  it('should reject invalid state transitions', () => {
    const { result } = renderHook(() => useEditorStateMachine());

    const initialState = result.current.state;

    act(() => {
      // Try to confirm edit without opening editor first
      result.current.transition({ type: 'CONFIRM_EDIT' });
    });

    // State should remain unchanged
    expect(result.current.state).toBe(initialState);
  });

  it('should allow START_GENERATE from success state', () => {
    const { result } = renderHook(() => useEditorStateMachine());

    act(() => {
      result.current.transition({ type: 'START_GENERATE' });
      result.current.transition({ type: 'GENERATE_SUCCESS' });
    });

    expect(result.current.state).toBe('success');

    act(() => {
      result.current.transition({ type: 'START_GENERATE' });
    });

    expect(result.current.state).toBe('generating');
  });

  describe('state transition table', () => {
    it('should allow all transitions defined in STATE_TRANSITIONS', () => {
      const { result } = renderHook(() => useEditorStateMachine());

      // Test: idle -> editing
      act(() => {
        result.current.transition({ type: 'OPEN_EDITOR' });
      });
      expect(result.current.state).toBe('editing');

      // Test: editing -> idle
      act(() => {
        result.current.transition({ type: 'CANCEL_EDIT' });
      });
      expect(result.current.state).toBe('idle');

      // Test: idle -> generating
      act(() => {
        result.current.transition({ type: 'START_GENERATE' });
      });
      expect(result.current.state).toBe('generating');

      // Test: generating -> success
      act(() => {
        result.current.transition({ type: 'GENERATE_SUCCESS' });
      });
      expect(result.current.state).toBe('success');

      // Test: success -> generating
      act(() => {
        result.current.transition({ type: 'START_GENERATE' });
      });
      expect(result.current.state).toBe('generating');

      // Test: generating -> error
      act(() => {
        result.current.transition({ type: 'GENERATE_ERROR', error: 'Test error' });
      });
      expect(result.current.state).toBe('error');

      // Test: error -> editing
      act(() => {
        result.current.transition({ type: 'OPEN_EDITOR' });
      });
      expect(result.current.state).toBe('editing');
    });
  });
});
