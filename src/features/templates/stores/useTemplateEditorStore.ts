/**
 * Template Editor Store
 *
 * Epic 5 - Story 5.3: Template Editor
 * Zustand store for template editor state management with history
 */

import { create } from 'zustand';
import type { TemplateEditorState, HistoryRecord } from '../types/editor';
import type { TemplateFieldKey, TemplateJSONFormat } from '../types/template';

const MAX_HISTORY_SIZE = 10;

/**
 * Default empty field values
 */
const defaultFields: TemplateJSONFormat = {
  subject: '',
  style: '',
  composition: '',
  colors: '',
  lighting: '',
  additional: '',
};

/**
 * Template editor Zustand store
 */
export const useTemplateEditorStore = create<TemplateEditorState>((set, get) => ({
  // Initial state
  fields: { ...defaultFields },
  history: [{ fields: { ...defaultFields }, timestamp: Date.now() }],
  historyIndex: 0,
  isPreviewExpanded: true,
  activeField: null,

  // Actions
  updateField: (field: TemplateFieldKey, value: string) => {
    const { fields, history, historyIndex } = get();

    // Create new field state
    const newFields = { ...fields, [field]: value };

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({
      fields: newFields,
      timestamp: Date.now(),
    });

    // Limit history size
    if (newHistory.length > MAX_HISTORY_SIZE) {
      newHistory.shift();
    }

    set({
      fields: newFields,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const { historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({
        fields: get().history[newIndex].fields,
        historyIndex: newIndex,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({
        fields: history[newIndex].fields,
        historyIndex: newIndex,
      });
    }
  },

  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,

  togglePreview: () =>
    set((state) => ({ isPreviewExpanded: !state.isPreviewExpanded })),

  setActiveField: (field: TemplateFieldKey | null) =>
    set({ activeField: field }),

  reset: (initialFields: Partial<TemplateJSONFormat> = {}) => {
    const mergedFields = { ...defaultFields, ...initialFields };
    set({
      fields: mergedFields,
      history: [{ fields: mergedFields, timestamp: Date.now() }],
      historyIndex: 0,
      isPreviewExpanded: true,
      activeField: null,
    });
  },
}));
