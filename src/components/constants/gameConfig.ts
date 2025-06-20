// components/constants/gameConfig.ts

// --- Native Dimensions of Board Elements ---
// These are the "base" pixel sizes you designed the game with.
// Your game uses 32x32px images for squares, and 1px gaps between them.
export const CELL_NATIVE_PX = 32; // Each square image is 32x32 pixels
export const GAP_NATIVE_PX = 1;   // 1px gap between squares in the grid layout

// --- Mine Density ---
// Calculate the original mine density to maintain it across different grid sizes.
const BASE_ROWS = 16;
const BASE_COLS = 30;
const BASE_MINES = 3;
export const BASE_MINE_DENSITY = BASE_MINES / (BASE_ROWS * BASE_COLS); // ~0.20625

// --- Responsive Game Size Configurations ---
// Define different predefined grid sizes for various screen dimensions.
// You can adjust these rows/cols values as you see fit for different devices.
export interface GameSizeConfig {
    id: string;
    rows: number;
    cols: number;
    description: string; // For debugging/identification
}

export const GAME_SIZES: GameSizeConfig[] = [
    // Mobile (Portrait) - Small
    { id: 'mobile-xs', rows: 9, cols: 9, description: 'Mobile XS (9x9)' },
    // Mobile (Portrait) - Medium/Large, or Tablet (Portrait) - Small
    { id: 'mobile-s', rows: 10, cols: 16, description: 'Mobile S (12x16)' },
    // Tablet (Portrait/Landscape) or Small Desktop
    { id: 'tablet', rows: 12, cols: 20, description: 'Tablet (16x24)' },
    // Standard Desktop (your original size)
    { id: 'desktop-s', rows: 12, cols: 30, description: 'Desktop S (16x30)' },
    // Larger Desktop Monitors
    { id: 'desktop-m', rows: 14, cols: 30, description: 'Desktop M (20x36)' },
    // Very Large Displays / Max Size
    { id: 'desktop-l', rows: 16, cols: 30, description: 'Desktop L (24x40)' },
];

// --- Thresholds for applying game size configs based on window width ---
// The game will pick the largest config whose threshold is met by the current window width.
export const SIZE_THRESHOLDS: { [key: string]: number } = {
    'mobile-xs': 0,    // Default for any screen width 0px and up
    'mobile-s': 480,   // e.g., for screens 480px wide and up
    'tablet': 768,     // e.g., for screens 768px wide and up
    'desktop-s': 1024, // e.g., for screens 1024px wide and up
    'desktop-m': 1440, // e.g., for screens 1440px wide and up
    'desktop-l': 1920, // e.g., for screens 1920px wide and up
};

// --- Other Global Display Constants ---
// These remain fixed as they relate to the internal representation of symbols
export const MINE_VALUE = 99;
export const UNOPENED_DISPLAY = '0';
export const FLAGGED_DISPLAY = 'F';
export const EXPLODED_MINE_DISPLAY = 'E';
export const WRONG_FLAG_DISPLAY = 'X';
export const UNEXPLODED_MINE_DISPLAY = 'M';
export const DOUBLE_CLICK_PREVIEW_DISPLAY = 'D';
export const REVEALED_ZERO_DISPLAY = 'Z';
export const MAX_TIME = 999;