// components/SingleDigitDisplay.tsx
import React from 'react';
import DigitSegment from './DigitSegment';
import { DIGIT_PATTERNS, RECT_GAP_HORIZONTAL, RECT_GAP_VERTICAL, RECT_HEIGHT, RECT_WIDTH } from './constants/digitPatterns';

interface SingleDigitDisplayProps {
  digit: number; // The digit (0-9) to display
}

const SingleDigitDisplay: React.FC<SingleDigitDisplayProps> = ({ digit }) => {
  const pattern = DIGIT_PATTERNS[digit]; 

  if (pattern === undefined) { // Check for undefined to handle invalid digits
    console.warn(`No pattern found for digit: ${digit}. Rendering a default.`);
    // You could render a blank or error digit here if preferred
    return (
        <div style={{
            display: 'flex',
            gap: `${RECT_GAP_HORIZONTAL}px`,
            // Set explicit height based on 5 segments + 4 gaps
            height: `${(RECT_HEIGHT * 5) + (RECT_GAP_VERTICAL * 4)}px`,
            width: `${(RECT_WIDTH * 3) + (RECT_GAP_HORIZONTAL * 2)}px`
        }}>
            {/* Render empty spaces or a placeholder */}
            <div style={{ flex: 1, backgroundColor: 'transparent' }}/>
            <div style={{ flex: 1, backgroundColor: 'transparent' }}/>
            <div style={{ flex: 1, backgroundColor: 'transparent' }}/>
        </div>
    );
  }

  // Split the 15 segments into three columns of 5
  const column1 = pattern.slice(0, 5);
  const column2 = pattern.slice(5, 10);
  const column3 = pattern.slice(10, 15);

  return (
    <div
      style={{
        display: 'flex',
        gap: `${RECT_GAP_HORIZONTAL}px`, // Horizontal gap between columns
      }}
    >
      {/* Column 1 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: `${RECT_GAP_VERTICAL}px`, // Vertical gap between segments
        }}
      >
        {column1.map((type, index) => (
          <DigitSegment key={`col1-${index}`} type={type as 1 | 0 | -1} />
        ))}
      </div>

      {/* Column 2 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: `${RECT_GAP_VERTICAL}px`, // Vertical gap between segments
        }}
      >
        {column2.map((type, index) => (
          <DigitSegment key={`col2-${index}`} type={type as 1 | 0 | -1} />
        ))}
      </div>

      {/* Column 3 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: `${RECT_GAP_VERTICAL}px`, // Vertical gap between segments
        }}
      >
        {column3.map((type, index) => (
          <DigitSegment key={`col3-${index}`} type={type as 1 | 0 | -1} />
        ))}
      </div>
    </div>
  );
};

export default SingleDigitDisplay;