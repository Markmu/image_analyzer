/**
 * Editor State Machine Hook
 *
 * Epic 7 - Story 7.2: Template Library
 * Detail Page Optimization - State Management
 *
 * Implements a state machine pattern for managing editor states,
 * preventing race conditions and ensuring valid state transitions.
 */

import { useState, useCallback } from 'react';

/**
 * Editor state types
 *
 * - idle: Initial state, showing summary
 * - editing: Editor expanded, user can edit
 * - generating: Image generation in progress
 * - success: Generation completed successfully
 * - error: Generation or edit failed
 */
export type EditorState =
  | 'idle'
  | 'editing'
  | 'generating'
  | 'success'
  | 'error';

/**
 * Editor events that trigger state transitions
 */
export type EditorEvent =
  | { type: 'OPEN_EDITOR' }
  | { type: 'CONFIRM_EDIT' }
  | { type: 'CANCEL_EDIT' }
  | { type: 'START_GENERATE' }
  | { type: 'GENERATE_SUCCESS' }
  | { type: 'GENERATE_ERROR'; error: string };

/**
 * Valid state transitions
 *
 * Defines which events are allowed from each state.
 * Prevents invalid state transitions that could cause bugs.
 */
const STATE_TRANSITIONS: Record<EditorState, EditorEvent['type'][]> = {
  idle: ['OPEN_EDITOR', 'START_GENERATE'],
  editing: ['CONFIRM_EDIT', 'CANCEL_EDIT'],
  generating: ['GENERATE_SUCCESS', 'GENERATE_ERROR'],
  success: ['OPEN_EDITOR', 'START_GENERATE'],
  error: ['OPEN_EDITOR', 'START_GENERATE'],
};

/**
 * State machine reducer
 *
 * Handles state transitions based on current state and event.
 * Returns the same state if the transition is invalid.
 */
function stateReducer(currentState: EditorState, event: EditorEvent): EditorState {
  const allowedEvents = STATE_TRANSITIONS[currentState];

  if (!allowedEvents.includes(event.type)) {
    // Log invalid transition in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `Invalid state transition: ${currentState} + ${event.type} is not allowed`
      );
    }
    return currentState;
  }

  switch (event.type) {
    case 'OPEN_EDITOR':
      return 'editing';
    case 'CONFIRM_EDIT':
      return 'idle';
    case 'CANCEL_EDIT':
      return 'idle';
    case 'START_GENERATE':
      return 'generating';
    case 'GENERATE_SUCCESS':
      return 'success';
    case 'GENERATE_ERROR':
      return 'error';
    default:
      // TypeScript exhaustiveness check
      const _exhaustiveCheck: never = event;
      return currentState;
  }
}

/**
 * State machine hook return type
 */
export interface UseEditorStateMachineReturn {
  /** Current state */
  state: EditorState;
  /** Transition to a new state based on event */
  transition: (event: EditorEvent) => void;
  /** Convenience: Check if editor is expanded */
  isEditorExpanded: boolean;
  /** Convenience: Check if generating */
  isGenerating: boolean;
  /** Convenience: Check if in error state */
  isError: boolean;
  /** Convenience: Check if in success state */
  isSuccess: boolean;
  /** Last error message (if in error state) */
  error: string | null;
}

/**
 * Editor State Machine Hook
 *
 * Manages editor state transitions using a state machine pattern.
 * Prevents race conditions and ensures only valid transitions occur.
 *
 * @example
 * ```tsx
 * const { state, transition, isGenerating, isEditorExpanded } = useEditorStateMachine();
 *
 * // Open editor
 * transition({ type: 'OPEN_EDITOR' });
 *
 * // Start generation
 * transition({ type: 'START_GENERATE' });
 *
 * // Handle completion
 * if (state === 'generating') {
 *   transition({ type: 'GENERATE_SUCCESS' });
 * }
 * ```
 */
export function useEditorStateMachine(): UseEditorStateMachineReturn {
  const [state, setState] = useState<EditorState>('idle');
  const [error, setError] = useState<string | null>(null);

  const transition = useCallback((event: EditorEvent) => {
    setState((currentState) => {
      const newState = stateReducer(currentState, event);

      // Update error state for error events
      if (event.type === 'GENERATE_ERROR') {
        setError(event.error);
      } else if (newState !== 'error') {
        setError(null);
      }

      return newState;
    });
  }, []);

  return {
    state,
    transition,
    isEditorExpanded: state === 'editing',
    isGenerating: state === 'generating',
    isError: state === 'error',
    isSuccess: state === 'success',
    error,
  };
}
