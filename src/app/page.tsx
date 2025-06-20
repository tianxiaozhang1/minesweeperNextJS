// import Image from "next/image";
import MinesweeperGame from '../components/MinesweeperGame';

interface SquareGridProps {
  rows: number;
  cols: number;
  pattern: number[][]; // 2D array representing the pattern (0-8)
}

const SquareGrid: React.FC<SquareGridProps> = ({ rows, cols, pattern }) => {
  if (!pattern || pattern.length !== rows || pattern[0].length !== cols) {
      console.error("Pattern dimensions do not match rows and columns.");
      return null;
  }

  const squareSize = 32; // Size for each square (SVG will fill this)
  const gap = 1; // 1 pixel gap

  const getSvgPath = (value: number): string => {
      return `/svg/${value}.svg`;
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${squareSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${squareSize}px)`,
        gap: `${gap}px`,
        border: `${gap}px solid transparent`,
      }}
    >
      {pattern.map((row, rowIndex) =>
        row.map((value, colIndex) => (
          <img
            key={`${rowIndex}-${colIndex}`}
            src={getSvgPath(value)}
            alt={`Pattern square ${value}`}
            width={squareSize}
            height={squareSize}
            style={{ display: 'block' }} // Ensures proper layout without extra spacing
          />
        ))
      )}
    </div>
  );
};

export default function Home() {
    return (
        <div className="bg-slate-100 w-full h-screen flex justify-center items-center">                
            <MinesweeperGame />
        </div>
    );
}
