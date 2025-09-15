// components/MinesCounterDisplay.tsx
import React from 'react';
import SingleDigitDisplay from './SingleDigitDisplay';
import { NUMBER_SPACING_HORIZONTAL } from './constants/digitPatterns';

interface MinesCounterDisplayProps {
  value: number; // The number of mines to display (0-999)
}

const MinesCounterDisplay: React.FC<MinesCounterDisplayProps> = ({ value }) => {
  // Ensure the value is within 0-999 range and padded to 3 digits
  const displayValue = String(Math.max(0, Math.min(999, value))).padStart(3, '0');
  const digits = displayValue.split('').map(Number);

  return (
    <div className='p-1.5' style={{ display: 'flex' }}>
      {digits.map((digit, index) => (
        <React.Fragment key={index}>
          <SingleDigitDisplay digit={digit} />
          {index < digits.length - 1 && (
            <div style={{ width: `${NUMBER_SPACING_HORIZONTAL}px` }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default MinesCounterDisplay;