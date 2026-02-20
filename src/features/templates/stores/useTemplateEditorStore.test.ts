/**
 * Template Editor Store Tests
 *
 * Epic 5 - Story 5.3: Template Editor
 * Task 8: Unit tests for Zustand store
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act } from '@testing-library/react';
import { useTemplateEditorStore } from './useTemplateEditorStore';
import type { TemplateFieldKey } from '../types/template';

describe('useTemplateEditorStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { reset } = useTemplateEditorStore.getState();
    reset({});
  });

  describe('Initial State', () => {
    it('should have default empty fields', () => {
      const { fields } = useTemplateEditorStore.getState();

      expect(fields.subject).toBe('');
      expect(fields.style).toBe('');
      expect(fields.composition).toBe('');
      expect(fields.colors).toBe('');
      expect(fields.lighting).toBe('');
      expect(fields.additional).toBe('');
    });

    it('should have initial history with one entry', () => {
      const { history, historyIndex } = useTemplateEditorStore.getState();

      expect(history).toHaveLength(1);
      expect(historyIndex).toBe(0);
    });

    it('should have preview expanded by default', () => {
      const { isPreviewExpanded } = useTemplateEditorStore.getState();

      expect(isPreviewExpanded).toBe(true);
    });

    it('should have no active field by default', () => {
      const { activeField } = useTemplateEditorStore.getState();

      expect(activeField).toBeNull();
    });
  });

  describe('updateField', () => {
    it('should update a single field', () => {
      const { updateField } = useTemplateEditorStore.getState();

      act(() => {
        updateField('subject', '一位美丽的女性');
      });

      const { fields } = useTemplateEditorStore.getState();
      expect(fields.subject).toBe('一位美丽的女性');
    });

    it('should add new entry to history', () => {
      const { updateField, history } = useTemplateEditorStore.getState();
      const initialHistoryLength = history.length;

      act(() => {
        updateField('subject', '一位美丽的女性');
      });

      const { history: newHistory } = useTemplateEditorStore.getState();
      expect(newHistory.length).toBe(initialHistoryLength + 1);
    });

    it('should update historyIndex to latest', () => {
      const { updateField } = useTemplateEditorStore.getState();

      act(() => {
        updateField('subject', '一位美丽的女性');
      });

      const { historyIndex, history } = useTemplateEditorStore.getState();
      expect(historyIndex).toBe(history.length - 1);
    });

    it('should record timestamp in history', () => {
      vi.useFakeTimers();
      const now = Date.now();
      vi.setSystemTime(now);

      const { updateField } = useTemplateEditorStore.getState();

      act(() => {
        updateField('subject', '一位美丽的女性');
      });

      const { history } = useTemplateEditorStore.getState();
      expect(history[history.length - 1].timestamp).toBe(now);

      vi.useRealTimers();
    });

    it('should limit history to MAX_HISTORY_SIZE (10)', () => {
      const { updateField } = useTemplateEditorStore.getState();

      // Add 15 entries
      for (let i = 0; i < 15; i++) {
        act(() => {
          updateField('subject', `value ${i}`);
        });
      }

      const { history } = useTemplateEditorStore.getState();
      expect(history.length).toBe(10);
    });

    it('should trim history when updating after undo', () => {
      const { updateField, undo } = useTemplateEditorStore.getState();

      // Add 3 entries (total 4 including initial)
      act(() => {
        updateField('subject', 'value 1');
        updateField('subject', 'value 2');
        updateField('subject', 'value 3');
      });

      // Undo twice (back to first update, historyIndex = 1)
      act(() => {
        undo();
        undo();
      });

      // Add new entry (should trim future history after historyIndex)
      act(() => {
        updateField('style', 'new style');
      });

      const { history, historyIndex } = useTemplateEditorStore.getState();
      // History: [initial, value 1, new style] = 3 entries
      // Trims from historyIndex + 1, keeps [0..historyIndex], adds new
      expect(history.length).toBe(3);
      expect(historyIndex).toBe(2);
    });
  });

  describe('undo', () => {
    it('should go back to previous history state', () => {
      const { updateField, undo } = useTemplateEditorStore.getState();

      act(() => {
        updateField('subject', 'value 1');
        updateField('subject', 'value 2');
      });

      act(() => {
        undo();
      });

      const { fields, historyIndex } = useTemplateEditorStore.getState();
      expect(fields.subject).toBe('value 1');
      expect(historyIndex).toBe(1);
    });

    it('should not go back if at beginning of history', () => {
      const { undo } = useTemplateEditorStore.getState();

      act(() => {
        undo();
      });

      const { historyIndex } = useTemplateEditorStore.getState();
      expect(historyIndex).toBe(0);
    });

    it('should restore all fields from history', () => {
      const { updateField, undo } = useTemplateEditorStore.getState();

      act(() => {
        updateField('subject', 'subject 1');
        updateField('style', 'style 1');
        updateField('subject', 'subject 2');
      });

      act(() => {
        undo();
      });

      const { fields } = useTemplateEditorStore.getState();
      expect(fields.subject).toBe('subject 1');
      expect(fields.style).toBe('style 1');
    });
  });

  describe('redo', () => {
    it('should go forward to next history state', () => {
      const { updateField, undo, redo } = useTemplateEditorStore.getState();

      act(() => {
        updateField('subject', 'value 1');
        updateField('subject', 'value 2');
      });

      act(() => {
        undo();
      });

      act(() => {
        redo();
      });

      const { fields, historyIndex } = useTemplateEditorStore.getState();
      expect(fields.subject).toBe('value 2');
      expect(historyIndex).toBe(2);
    });

    it('should not go forward if at end of history', () => {
      const { updateField, redo } = useTemplateEditorStore.getState();

      act(() => {
        updateField('subject', 'value 1');
      });

      act(() => {
        redo();
      });

      const { historyIndex, history } = useTemplateEditorStore.getState();
      expect(historyIndex).toBe(history.length - 1);
    });
  });

  describe('canUndo', () => {
    it('should return false when at beginning of history', () => {
      const { canUndo } = useTemplateEditorStore.getState();
      expect(canUndo()).toBe(false);
    });

    it('should return true when not at beginning of history', () => {
      const { updateField, canUndo } = useTemplateEditorStore.getState();

      act(() => {
        updateField('subject', 'value 1');
      });

      expect(canUndo()).toBe(true);
    });
  });

  describe('canRedo', () => {
    it('should return false when at end of history', () => {
      const { updateField, canRedo } = useTemplateEditorStore.getState();

      act(() => {
        updateField('subject', 'value 1');
      });

      expect(canRedo()).toBe(false);
    });

    it('should return true when not at end of history', () => {
      const { updateField, undo, canRedo } = useTemplateEditorStore.getState();

      act(() => {
        updateField('subject', 'value 1');
      });

      act(() => {
        undo();
      });

      expect(canRedo()).toBe(true);
    });
  });

  describe('togglePreview', () => {
    it('should toggle isPreviewExpanded', () => {
      const { togglePreview } = useTemplateEditorStore.getState();

      expect(useTemplateEditorStore.getState().isPreviewExpanded).toBe(true);

      act(() => {
        togglePreview();
      });

      expect(useTemplateEditorStore.getState().isPreviewExpanded).toBe(false);

      act(() => {
        togglePreview();
      });

      expect(useTemplateEditorStore.getState().isPreviewExpanded).toBe(true);
    });
  });

  describe('setActiveField', () => {
    it('should set active field', () => {
      const { setActiveField } = useTemplateEditorStore.getState();

      act(() => {
        setActiveField('subject');
      });

      expect(useTemplateEditorStore.getState().activeField).toBe('subject');
    });

    it('should clear active field when set to null', () => {
      const { setActiveField } = useTemplateEditorStore.getState();

      act(() => {
        setActiveField('subject');
      });

      expect(useTemplateEditorStore.getState().activeField).toBe('subject');

      act(() => {
        setActiveField(null);
      });

      expect(useTemplateEditorStore.getState().activeField).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset all fields to empty', () => {
      const { updateField, reset } = useTemplateEditorStore.getState();

      act(() => {
        updateField('subject', 'value 1');
        updateField('style', 'value 2');
      });

      act(() => {
        reset({});
      });

      const { fields } = useTemplateEditorStore.getState();
      expect(fields.subject).toBe('');
      expect(fields.style).toBe('');
    });

    it('should reset with initial fields', () => {
      const { reset } = useTemplateEditorStore.getState();

      act(() => {
        reset({
          subject: 'initial subject',
          style: 'initial style',
        });
      });

      const { fields } = useTemplateEditorStore.getState();
      expect(fields.subject).toBe('initial subject');
      expect(fields.style).toBe('initial style');
      expect(fields.composition).toBe('');
    });

    it('should reset history', () => {
      const { updateField, reset } = useTemplateEditorStore.getState();

      act(() => {
        updateField('subject', 'value 1');
        updateField('subject', 'value 2');
      });

      act(() => {
        reset({});
      });

      const { history, historyIndex } = useTemplateEditorStore.getState();
      expect(history).toHaveLength(1);
      expect(historyIndex).toBe(0);
    });

    it('should reset UI state', () => {
      const { togglePreview, setActiveField, reset } = useTemplateEditorStore.getState();

      act(() => {
        togglePreview();
        setActiveField('subject');
      });

      act(() => {
        reset({});
      });

      const { isPreviewExpanded, activeField } = useTemplateEditorStore.getState();
      expect(isPreviewExpanded).toBe(true);
      expect(activeField).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid consecutive updates', () => {
      const { updateField } = useTemplateEditorStore.getState();

      act(() => {
        updateField('subject', 'a');
        updateField('subject', 'ab');
        updateField('subject', 'abc');
        updateField('subject', 'abcd');
      });

      const { fields, history } = useTemplateEditorStore.getState();
      expect(fields.subject).toBe('abcd');
      expect(history.length).toBe(5); // Initial + 4 updates
    });

    it('should handle empty string updates', () => {
      const { updateField } = useTemplateEditorStore.getState();

      act(() => {
        updateField('subject', 'value');
      });

      act(() => {
        updateField('subject', '');
      });

      const { fields } = useTemplateEditorStore.getState();
      expect(fields.subject).toBe('');
    });

    it('should handle all field types', () => {
      const fieldKeys: TemplateFieldKey[] = [
        'subject',
        'style',
        'composition',
        'colors',
        'lighting',
        'additional',
      ];

      const { updateField } = useTemplateEditorStore.getState();

      act(() => {
        fieldKeys.forEach((key) => {
          updateField(key, `test ${key}`);
        });
      });

      const { fields } = useTemplateEditorStore.getState();
      fieldKeys.forEach((key) => {
        expect(fields[key]).toBe(`test ${key}`);
      });
    });
  });
});
