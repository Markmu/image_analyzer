/**
 * Template Editor Store Unit Tests
 *
 * Epic 5 - Story 5.3: Template Editor
 * Tests for template editor Zustand store
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTemplateEditorStore } from '@/features/templates/stores';

describe('useTemplateEditorStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { reset } = useTemplateEditorStore.getState();
    reset({});
  });

  describe('initial state', () => {
    it('should have empty initial fields', () => {
      const { result } = renderHook(() => useTemplateEditorStore());
      const { fields } = result.current;

      expect(fields).toEqual({
        subject: '',
        style: '',
        composition: '',
        colors: '',
        lighting: '',
        additional: '',
      });
    });

    it('should have initial history with one record', () => {
      const { result } = renderHook(() => useTemplateEditorStore());
      const { history, historyIndex } = result.current;

      expect(history).toHaveLength(1);
      expect(historyIndex).toBe(0);
    });

    it('should have preview expanded by default', () => {
      const { result } = renderHook(() => useTemplateEditorStore());
      const { isPreviewExpanded } = result.current;

      expect(isPreviewExpanded).toBe(true);
    });

    it('should have no active field initially', () => {
      const { result } = renderHook(() => useTemplateEditorStore());
      const { activeField } = result.current;

      expect(activeField).toBeNull();
    });
  });

  describe('updateField', () => {
    it('should update a single field', () => {
      const { result } = renderHook(() => useTemplateEditorStore());

      act(() => {
        result.current.updateField('subject', '一位美丽的女性');
      });

      expect(result.current.fields.subject).toBe('一位美丽的女性');
    });

    it('should add to history when updating a field', () => {
      const { result } = renderHook(() => useTemplateEditorStore());
      const initialHistoryLength = result.current.history.length;

      act(() => {
        result.current.updateField('subject', '一位美丽的女性');
      });

      expect(result.current.history.length).toBe(initialHistoryLength + 1);
      expect(result.current.historyIndex).toBe(initialHistoryLength);
    });

    it('should limit history to MAX_HISTORY_SIZE (10)', () => {
      const { result } = renderHook(() => useTemplateEditorStore());

      // Add 11 updates
      for (let i = 0; i < 11; i++) {
        act(() => {
          result.current.updateField('subject', `Update ${i}`);
        });
      }

      expect(result.current.history.length).toBe(10);
    });

    it('should update multiple fields correctly', () => {
      const { result } = renderHook(() => useTemplateEditorStore());

      act(() => {
        result.current.updateField('subject', '一位美丽的女性');
        result.current.updateField('style', '肖像摄影风格');
      });

      expect(result.current.fields.subject).toBe('一位美丽的女性');
      expect(result.current.fields.style).toBe('肖像摄影风格');
    });
  });

  describe('undo', () => {
    it('should undo to previous state', () => {
      const { result } = renderHook(() => useTemplateEditorStore());

      act(() => {
        result.current.updateField('subject', 'First');
        result.current.updateField('subject', 'Second');
      });

      act(() => {
        result.current.undo();
      });

      expect(result.current.fields.subject).toBe('First');
    });

    it('should not undo when at history start', () => {
      const { result } = renderHook(() => useTemplateEditorStore());

      const initialSubject = result.current.fields.subject;

      act(() => {
        result.current.undo();
      });

      expect(result.current.fields.subject).toBe(initialSubject);
    });

    it('should update historyIndex when undoing', () => {
      const { result } = renderHook(() => useTemplateEditorStore());

      act(() => {
        result.current.updateField('subject', 'First');
        result.current.updateField('subject', 'Second');
      });

      const indexBeforeUndo = result.current.historyIndex;

      act(() => {
        result.current.undo();
      });

      expect(result.current.historyIndex).toBe(indexBeforeUndo - 1);
    });
  });

  describe('redo', () => {
    it('should redo to next state', () => {
      const { result } = renderHook(() => useTemplateEditorStore());

      act(() => {
        result.current.updateField('subject', 'First');
        result.current.updateField('subject', 'Second');
      });

      act(() => {
        result.current.undo();
      });

      act(() => {
        result.current.redo();
      });

      expect(result.current.fields.subject).toBe('Second');
    });

    it('should not redo when at history end', () => {
      const { result } = renderHook(() => useTemplateEditorStore());

      act(() => {
        result.current.updateField('subject', 'First');
      });

      const currentSubject = result.current.fields.subject;

      act(() => {
        result.current.redo();
      });

      expect(result.current.fields.subject).toBe(currentSubject);
    });

    it('should update historyIndex when redoing', () => {
      const { result } = renderHook(() => useTemplateEditorStore());

      act(() => {
        result.current.updateField('subject', 'First');
        result.current.updateField('subject', 'Second');
      });

      act(() => {
        result.current.undo();
      });

      const indexBeforeRedo = result.current.historyIndex;

      act(() => {
        result.current.redo();
      });

      expect(result.current.historyIndex).toBe(indexBeforeRedo + 1);
    });
  });

  describe('canUndo', () => {
    it('should return false when at history start', () => {
      const { result } = renderHook(() => useTemplateEditorStore());

      expect(result.current.canUndo()).toBe(false);
    });

    it('should return true when can undo', () => {
      const { result } = renderHook(() => useTemplateEditorStore());

      act(() => {
        result.current.updateField('subject', 'First');
        result.current.updateField('subject', 'Second');
      });

      expect(result.current.canUndo()).toBe(true);
    });
  });

  describe('canRedo', () => {
    it('should return false when at history end', () => {
      const { result } = renderHook(() => useTemplateEditorStore());

      expect(result.current.canRedo()).toBe(false);
    });

    it('should return true when can redo', () => {
      const { result } = renderHook(() => useTemplateEditorStore());

      act(() => {
        result.current.updateField('subject', 'First');
        result.current.updateField('subject', 'Second');
      });

      act(() => {
        result.current.undo();
      });

      expect(result.current.canRedo()).toBe(true);
    });
  });

  describe('togglePreview', () => {
    it('should toggle preview expanded state', () => {
      const { result } = renderHook(() => useTemplateEditorStore());
      const initialState = result.current.isPreviewExpanded;

      act(() => {
        result.current.togglePreview();
      });

      expect(result.current.isPreviewExpanded).toBe(!initialState);
    });
  });

  describe('setActiveField', () => {
    it('should set active field', () => {
      const { result } = renderHook(() => useTemplateEditorStore());

      act(() => {
        result.current.setActiveField('subject');
      });

      expect(result.current.activeField).toBe('subject');
    });

    it('should clear active field when set to null', () => {
      const { result } = renderHook(() => useTemplateEditorStore());

      act(() => {
        result.current.setActiveField('subject');
      });

      act(() => {
        result.current.setActiveField(null);
      });

      expect(result.current.activeField).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset to initial fields', () => {
      const { result } = renderHook(() => useTemplateEditorStore());

      act(() => {
        result.current.updateField('subject', 'Modified');
        result.current.updateField('style', 'Modified');
      });

      act(() => {
        result.current.reset({ subject: 'Reset Subject', style: 'Reset Style' });
      });

      expect(result.current.fields.subject).toBe('Reset Subject');
      expect(result.current.fields.style).toBe('Reset Style');
      expect(result.current.fields.composition).toBe('');
    });

    it('should reset history when reset is called', () => {
      const { result } = renderHook(() => useTemplateEditorStore());

      act(() => {
        result.current.updateField('subject', 'First');
        result.current.updateField('subject', 'Second');
        result.current.updateField('subject', 'Third');
      });

      act(() => {
        result.current.reset({ subject: 'Reset' });
      });

      expect(result.current.history).toHaveLength(1);
      expect(result.current.historyIndex).toBe(0);
    });

    it('should reset preview expanded state', () => {
      const { result } = renderHook(() => useTemplateEditorStore());

      act(() => {
        result.current.togglePreview();
      });

      act(() => {
        result.current.reset({});
      });

      expect(result.current.isPreviewExpanded).toBe(true);
    });

    it('should clear active field when reset', () => {
      const { result } = renderHook(() => useTemplateEditorStore());

      act(() => {
        result.current.setActiveField('subject');
      });

      act(() => {
        result.current.reset({});
      });

      expect(result.current.activeField).toBeNull();
    });
  });

  describe('history record structure', () => {
    it('should store timestamp in history records', () => {
      const { result } = renderHook(() => useTemplateEditorStore());
      const beforeUpdate = Date.now();

      act(() => {
        result.current.updateField('subject', 'Test');
      });

      const afterUpdate = Date.now();

      expect(result.current.history[1].timestamp).toBeGreaterThanOrEqual(beforeUpdate);
      expect(result.current.history[1].timestamp).toBeLessThanOrEqual(afterUpdate);
    });

    it('should store field values in history records', () => {
      const { result } = renderHook(() => useTemplateEditorStore());

      act(() => {
        result.current.updateField('subject', 'Test Subject');
        result.current.updateField('style', 'Test Style');
      });

      expect(result.current.history[1].fields.subject).toBe('Test Subject');
      expect(result.current.history[2].fields.style).toBe('Test Style');
    });
  });
});
