// components/DigitSegment.tsx

import React from 'react';
import { COLORS, RECT_WIDTH, RECT_HEIGHT } from './constants/digitPatterns';

interface DigitSegmentProps {
  type: 1 | 0 | -1;
}

const DigitSegment: React.FC<DigitSegmentProps> = ({ type }) => {
  // If the type is 0, we render an empty space with the defined dimensions
  // This ensures it takes up space but doesn't have an active or inactive segment appearance.
  if (type === 0) {
    return (
      <div
        style={{
          width: `${RECT_WIDTH}px`,
          height: `${RECT_HEIGHT}px`,
          backgroundColor: 'transparent', // Make it completely transparent
          // You could also consider minWidth/minHeight or flexBasis if it needs to collapse
          // but for consistent layout, keeping dimensions is often better for a grid.
        }}
      />
    );
  }

  // For active (1) or inactive (-1) segments, render with their respective colors
  const backgroundColor = COLORS[type];

  return (
    <div
      style={{
        width: `${RECT_WIDTH}px`,
        height: `${RECT_HEIGHT}px`,
        backgroundColor: backgroundColor,
      }}
    />
  );
};

export default DigitSegment;