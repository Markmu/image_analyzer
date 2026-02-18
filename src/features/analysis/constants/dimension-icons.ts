/**
 * Dimension Icons
 *
 * Icons for each style dimension
 */

import { Sun, Grid3X3, Palette, Sparkles } from 'lucide-react';

export const dimensionIcons = {
  lighting: Sun, // 光影 ☀️
  composition: Grid3X3, // 构图 🖼️
  color: Palette, // 色彩 🎨
  artisticStyle: Sparkles, // 艺术风格 🎭
} as const;
