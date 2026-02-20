/**
 * Utility functions for className merging
 * This is a simple implementation that can be replaced with clsx or tailwind-merge
 */

type ClassValue = string | undefined | null | false | ClassValue[];

/**
 * Merge className values similar to clsx/tailwind-merge
 */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === 'string') {
      classes.push(input);
    } else if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) classes.push(nested);
    }
  }

  return classes.join(' ');
}
