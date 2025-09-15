export const DIGIT_PATTERNS = [
    [1, 1, 1, 1, 1, 1, -1, 0, -1, 1, 1, 1, 1, 1, 1], // 0
    [0, 0, 0, 0, 0, 0, -1, 0, -1, 0, 1, 1, 1, 1, 1], // 1
    [1, 0, 1, 1, 1, 1, -1, 1, -1, 1, 1, 1, 1, 0, 1], // 2
    [1, 0, 1, 0, 1, 1, -1, 1, -1, 1, 1, 1, 1, 1, 1], // 3
    [1, 1, 1, 0, 0, 0, -1, 1, -1, 0, 1, 1, 1, 1, 1], // 4
    [1, 1, 1, 0, 1, 1, -1, 1, -1, 1, 1, 0, 1, 1, 1], // 5
    [1, 1, 1, 1, 1, 1, -1, 1, -1, 1, 1, 0, 1, 1, 1], // 6
    [1, 0, 0, 0, 0, 1, 0, 0, -1, 0, 1, 1, 1, 1, 1], // 7
    [1, 1, 1, 1, 1, 1, -1, 1, -1, 1, 1, 1, 1, 1, 1], // 8
    [1, 1, 1, 0, 1, 1, -1, 1, -1, 1, 1, 1, 1, 1, 1], // 9
];

export const COLORS = {
    1: '#c8161c', // Active segment color
    '-1': '#1a242e', // Off/inactive segment color
    '0': '#42161a', // Special '0' segment color (for the middle column, seems to represent a gap)
};

export const RECT_WIDTH = 8;
export const RECT_HEIGHT = 10;
export const RECT_GAP_VERTICAL = 1; // All vertical spacing between rectangles
export const RECT_GAP_HORIZONTAL = 1; // All horizontal spacing between columns of rectangles
export const NUMBER_SPACING_HORIZONTAL = 4; // All horizontal spacing between the three-digit numbers