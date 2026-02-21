/**
 * History Feature Module
 *
 * Epic 7 - Story 7.1: Analysis History Management
 * Public API for the history feature
 */

// Service layer
export {
  getHistoryList,
  getHistoryDetail,
  deleteFromHistory,
  cleanOldHistory,
  saveToHistory,
  reuseFromHistory,
} from './lib/history-service';

// Types
export type {
  AnalysisHistory,
  TemplateSnapshot,
  MAX_HISTORY_RECORDS,
  HistoryListParams,
} from './types';
