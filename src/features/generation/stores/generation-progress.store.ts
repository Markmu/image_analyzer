/**
 * Generation Progress Store
 *
 * Epic 6 - Story 6.2: Generation Progress
 * Zustand store for managing generation progress state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  GenerationProgress,
  BatchGenerationProgress,
} from '../types/progress';
import type { GenerationStage } from '../types/progress';
import { nanoid } from 'nanoid';

/**
 * Generation progress store state
 */
interface GenerationProgressState {
  /** Active single generation tasks */
  singleGenerations: Map<string, GenerationProgress>;
  /** Active batch generation tasks */
  batchGenerations: Map<string, BatchGenerationProgress>;
  /** Notification permission status */
  notificationPermission: 'default' | 'granted' | 'denied';
}

/**
 * Generation progress store actions
 */
interface GenerationProgressActions {
  /** Add a new single generation task */
  addSingleGeneration: (progress: GenerationProgress) => void;
  /** Update an existing single generation task */
  updateSingleGeneration: (id: string, updates: Partial<GenerationProgress>) => void;
  /** Remove a single generation task */
  removeSingleGeneration: (id: string) => void;
  /** Get a single generation task */
  getSingleGeneration: (id: string) => GenerationProgress | undefined;
  /** Add a new batch generation task */
  addBatchGeneration: (batch: BatchGenerationProgress) => void;
  /** Update batch generation task */
  updateBatchGeneration: (id: string, updates: Partial<BatchGenerationProgress>) => void;
  /** Remove a batch generation task */
  removeBatchGeneration: (id: string) => void;
  /** Get a batch generation task */
  getBatchGeneration: (id: string) => BatchGenerationProgress | undefined;
  /** Update an item within a batch generation */
  updateBatchItem: (batchId: string, itemId: string, updates: Partial<GenerationProgress>) => void;
  /** Clear all completed generations */
  clearCompleted: () => void;
  /** Clear all generations */
  clearAll: () => void;
  /** Set notification permission */
  setNotificationPermission: (permission: 'default' | 'granted' | 'denied') => void;
}

/**
 * Create the generation progress store
 */
const useGenerationProgressStoreBase = create<
  GenerationProgressState & GenerationProgressActions
>()((set, get) => ({
  // Initial state
  singleGenerations: new Map(),
  batchGenerations: new Map(),
  notificationPermission: 'default',

  // Single generation actions
  addSingleGeneration: (progress) =>
    set((state) => {
      const newMap = new Map(state.singleGenerations);
      newMap.set(progress.id, progress);
      return { singleGenerations: newMap };
    }),

  updateSingleGeneration: (id, updates) =>
    set((state) => {
      try {
        const newMap = new Map(state.singleGenerations);
        const existing = newMap.get(id);
        if (existing) {
          newMap.set(id, { ...existing, ...updates, updatedAt: new Date() });
        }
        return { singleGenerations: newMap };
      } catch (error) {
        console.error('Error updating single generation:', error);
        return state;
      }
    }),

  removeSingleGeneration: (id) =>
    set((state) => {
      const newMap = new Map(state.singleGenerations);
      newMap.delete(id);
      return { singleGenerations: newMap };
    }),

  getSingleGeneration: (id) => {
    return get().singleGenerations.get(id);
  },

  // Batch generation actions
  addBatchGeneration: (batch) =>
    set((state) => {
      const newMap = new Map(state.batchGenerations);
      newMap.set(batch.id, batch);
      return { batchGenerations: newMap };
    }),

  updateBatchGeneration: (id, updates) =>
    set((state) => {
      try {
        const newMap = new Map(state.batchGenerations);
        const existing = newMap.get(id);
        if (existing) {
          const updated = { ...existing, ...updates };

          // Recalculate overall percentage
          if (updates.items || updates.completedItems !== undefined) {
            const totalItems = updated.items.length;
            const completedItems = updated.items.filter(
              (item) => item.stage === 'completed'
            ).length;
            updated.completedItems = completedItems;
            updated.overallPercentage = Math.round((completedItems / totalItems) * 100);
          }

          newMap.set(id, updated);
        }
        return { batchGenerations: newMap };
      } catch (error) {
        console.error('Error updating batch generation:', error);
        return state;
      }
    }),

  removeBatchGeneration: (id) =>
    set((state) => {
      const newMap = new Map(state.batchGenerations);
      newMap.delete(id);
      return { batchGenerations: newMap };
    }),

  getBatchGeneration: (id) => {
    return get().batchGenerations.get(id);
  },

  updateBatchItem: (batchId, itemId, updates) =>
    set((state) => {
      try {
        const newMap = new Map(state.batchGenerations);
        const batch = newMap.get(batchId);
        if (batch) {
          const updatedItems = batch.items.map((item) =>
            item.id === itemId ? { ...item, ...updates, updatedAt: new Date() } : item
          );

          // Recalculate batch statistics
          const completedItems = updatedItems.filter(
            (item) => item.stage === 'completed'
          ).length;
          const failedItems = updatedItems.filter(
            (item) => item.stage === 'failed'
          ).length;
          const overallPercentage = Math.round((completedItems / batch.totalItems) * 100);

          newMap.set(batchId, {
            ...batch,
            items: updatedItems,
            completedItems,
            failedItems,
            overallPercentage,
            updatedAt: new Date(),
          });
        }
        return { batchGenerations: newMap };
      } catch (error) {
        console.error('Error updating batch item:', error);
        return state;
      }
    }),

  // Utility actions
  clearCompleted: () =>
    set((state) => {
      const singleFiltered = new Map(
        Array.from(state.singleGenerations.entries()).filter(
          ([, progress]) => progress.stage !== 'completed'
        )
      );
      const batchFiltered = new Map(
        Array.from(state.batchGenerations.entries()).filter(
          ([, batch]) => batch.overallPercentage < 100
        )
      );
      return {
        singleGenerations: singleFiltered,
        batchGenerations: batchFiltered,
      };
    }),

  clearAll: () =>
    set({
      singleGenerations: new Map(),
      batchGenerations: new Map(),
    }),

  setNotificationPermission: (permission) =>
    set({ notificationPermission: permission }),
}));

/**
 * Wrapper store with persistence for notification permission
 */
export const useGenerationProgressStore = create<
  Pick<GenerationProgressState, 'notificationPermission'> &
    Pick<GenerationProgressActions, 'setNotificationPermission'>
>()(
  persist(
    (set) => ({
      notificationPermission: 'default',
      setNotificationPermission: (permission) => set({ notificationPermission: permission }),
    }),
    {
      name: 'generation-progress-storage',
      partialize: (state) => ({
        notificationPermission: state.notificationPermission,
      }),
    }
  )
);

/**
 * Combine base store and persisted store
 * Export hooks for accessing store data
 */
export const useSingleGenerations = () =>
  useGenerationProgressStoreBase((state) =>
    Array.from(state.singleGenerations.values())
  );

export const useBatchGenerations = () =>
  useGenerationProgressStoreBase((state) =>
    Array.from(state.batchGenerations.values())
  );

export const useGenerationById = (id: string) =>
  useGenerationProgressStoreBase((state) => {
    return (
      state.singleGenerations.get(id) ||
      state.batchGenerations.get(id)?.items.find((item) => item.id === id)
    );
  });

export const useBatchGenerationById = (id: string) =>
  useGenerationProgressStoreBase((state) => state.batchGenerations.get(id));

// Export the base store for advanced usage
export { useGenerationProgressStoreBase as generationProgressStore };
