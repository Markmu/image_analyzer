/**
 * Dimension Icons
 *
 * Icons for each style dimension
 */

import WbSunnyIcon from '@mui/icons-material/WbSunny';
import PhotoSizeSelectLargeIcon from '@mui/icons-material/PhotoSizeSelectLarge';
import PaletteIcon from '@mui/icons-material/Palette';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';

export const dimensionIcons = {
  lighting: WbSunnyIcon,        // 光影 ☀️
  composition: PhotoSizeSelectLargeIcon,  // 构图 🖼️
  color: PaletteIcon,              // 色彩 🎨
  artisticStyle: TheaterComedyIcon,  // 艺术风格 🎭
} as const;
