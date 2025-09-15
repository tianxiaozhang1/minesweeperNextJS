'use client';
import React, { useRef, useEffect } from 'react';

// Define props interface for potential future customization (e.g., size, colors)
interface SmileyFaceProps {
  size?: number; // Optional prop to scale the face, default to a base size
  pixelSize?: number; // Size of each "pixel" in the drawing
  backgroundColor?: string;
  faceColor?: string;
  eyeMouthColor?: string;
}

const SmileyFace: React.FC<SmileyFaceProps> = ({
  size = 1, // Default scale factor
  pixelSize = 82, // Default size of each square pixel in px
  backgroundColor = '#D4D4CE', // Light gray background
  faceColor = '#FAD201', // Yellow face
  eyeMouthColor = '#2C3E50', // Dark blue-gray for eyes and mouth
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get 2D rendering context');
      return;
    }

    // The pixel grid of the smiley face (relative to original image)
    // 9x9 grid excluding border
    // Rows represent Y-coordinates, Columns represent X-coordinates
    const pixelGrid = [
      // Row 0
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      // Row 1
    //   [0, 1, 1, 1, 1, 1, 1, 1, 0],
      // Row 2
      [0, 1, 1, 1, 1, 1, 1, 1, 0],
      // Row 3 (Eyes)
      [0, 1, 1, 0, 1, 0, 1, 1, 0],
      // Row 4
      
      // Row 5
      [0, 1, 1, 1, 1, 1, 1, 1, 0],
      // Row 6 (Mouth)
      [0, 1, 0, 1, 1, 1, 0, 1, 0],
      // Row 7
      [0, 1, 1, 0, 0, 0, 1, 1, 0],
      // Row 8
    //   [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 1, 1, 1, 0],
    ];

    const gridWidth = pixelGrid[0].length;
    const gridHeight = pixelGrid.length;

    // Calculate canvas dimensions based on the grid and pixel size
    // Adding 2 for the outer dark gray border on both sides
    canvas.width = (gridWidth + 2) * pixelSize * size;
    canvas.height = (gridHeight + 2) * pixelSize * size;

    // Clear canvas with the overall background color
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the outer dark gray border
    ctx.fillStyle = eyeMouthColor; // Reusing eyeMouthColor for border
    // Top border
    ctx.fillRect(0, 0, canvas.width, pixelSize * size);
    // Bottom border
    ctx.fillRect(0, canvas.height - (pixelSize * size), canvas.width, pixelSize * size);
    // Left border
    ctx.fillRect(0, 0, pixelSize * size, canvas.height);
    // Right border
    ctx.fillRect(canvas.width - (pixelSize * size), 0, pixelSize * size, canvas.height);

    // Draw the inner pixel grid
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const pixelType = pixelGrid[y][x];

        // Adjust coordinates to account for the outer border
        const drawX = (x + 1) * pixelSize * size;
        const drawY = (y + 1) * pixelSize * size;
        const drawSize = pixelSize * size;

        if (pixelType === 1) {
          // Face color (yellow)
          ctx.fillStyle = faceColor;
          ctx.fillRect(drawX, drawY, drawSize, drawSize);
        } else if (pixelType === 0) {
          // Eye/Mouth color (dark blue-gray) - these are the "empty" pixels in the yellow face
          ctx.fillStyle = eyeMouthColor;
          ctx.fillRect(drawX, drawY, drawSize, drawSize);
        }
        // If pixelType was -1 or something else, you could handle other colors
      }
    }
  }, [size, pixelSize, backgroundColor, faceColor, eyeMouthColor]); // Redraw if props change

  return (
    <canvas
      ref={canvasRef}
      aria-label="Pixel art smiley face" // Accessibility
      role="img" // Accessibility
    />
  );
};

export default SmileyFace;