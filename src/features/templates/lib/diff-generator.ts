/**
 * Diff Generator
 *
 * Epic 5 - Story 5.4: Prompt Optimization
 * Generate diff highlighting between original and optimized prompts
 */

import type { DiffItem } from '../types/optimization';

/**
 * Generate diff between two strings
 *
 * This is a simple word-based diff implementation.
 * For more sophisticated diff, consider using a library like 'diff' or 'fast-diff'.
 *
 * @param original - Original text
 * @param optimized - Optimized text
 * @returns Array of diff items for highlighting changes
 */
export function generateDiff(original: string, optimized: string): DiffItem[] {
  const diff: DiffItem[] = [];

  // Split into words (handle both Chinese and English)
  const originalWords = splitIntoWords(original);
  const optimizedWords = splitIntoWords(optimized);

  // Simple word-by-word comparison
  let i = 0;
  let j = 0;

  while (i < originalWords.length || j < optimizedWords.length) {
    if (i < originalWords.length && j < optimizedWords.length) {
      if (originalWords[i] === optimizedWords[j]) {
        // Words are the same
        diff.push({ type: 'unchanged', text: originalWords[i] });
        i++;
        j++;
      } else {
        // Words are different - check if it's an addition or removal
        // Look ahead to see if the word appears later in either array
        const originalIndex = optimizedWords.indexOf(originalWords[i], j);
        const optimizedIndex = originalWords.indexOf(optimizedWords[j], i);

        if (originalIndex > j && (optimizedIndex === -1 || originalIndex - j < optimizedIndex - i)) {
          // Word was removed (appears later in optimized)
          diff.push({ type: 'removed', text: originalWords[i] });
          i++;
        } else if (optimizedIndex > i) {
          // Word was added (appears later in original)
          diff.push({ type: 'added', text: optimizedWords[j] });
          j++;
        } else {
          // Words are different - treat as remove + add
          diff.push({ type: 'removed', text: originalWords[i] });
          diff.push({ type: 'added', text: optimizedWords[j] });
          i++;
          j++;
        }
      }
    } else if (i < originalWords.length) {
      // Remaining words in original (removed)
      diff.push({ type: 'removed', text: originalWords[i] });
      i++;
    } else if (j < optimizedWords.length) {
      // Remaining words in optimized (added)
      diff.push({ type: 'added', text: optimizedWords[j] });
      j++;
    }
  }

  return mergeConsecutiveDiffItems(diff);
}

/**
 * Split text into words
 * Handles both Chinese (character-based) and English (space-based)
 *
 * @param text - Text to split
 * @returns Array of words/tokens
 */
function splitIntoWords(text: string): string[] {
  const words: string[] = [];
  let currentWord = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    // Check if character is Chinese
    const isChinese = /[\u4e00-\u9fa5]/.test(char);
    // Check if character is whitespace
    const isWhitespace = /\s/.test(char);

    if (isChinese) {
      // Push current word if not empty
      if (currentWord.trim()) {
        words.push(currentWord.trim());
        currentWord = '';
      }
      // Add Chinese character as separate word
      words.push(char);
    } else if (isWhitespace) {
      // Push current word if not empty
      if (currentWord.trim()) {
        words.push(currentWord.trim());
        currentWord = '';
      }
      // Preserve whitespace in the next word
      if (!currentWord && words.length > 0 && /\s$/.test(words[words.length - 1])) {
        words[words.length - 1] += char;
      } else {
        currentWord = char;
      }
    } else {
      // Add character to current word
      currentWord += char;
    }
  }

  // Push remaining word
  if (currentWord.trim()) {
    words.push(currentWord.trim());
  }

  return words;
}

/**
 * Merge consecutive diff items of the same type
 *
 * @param diff - Array of diff items
 * @returns Merged diff items
 */
function mergeConsecutiveDiffItems(diff: DiffItem[]): DiffItem[] {
  if (diff.length === 0) return [];

  const merged: DiffItem[] = [diff[0]];

  for (let i = 1; i < diff.length; i++) {
    const lastItem = merged[merged.length - 1];
    const currentItem = diff[i];

    if (lastItem.type === currentItem.type) {
      // Merge consecutive items of the same type
      lastItem.text += currentItem.text;
    } else {
      // Add new item
      merged.push(currentItem);
    }
  }

  return merged;
}
