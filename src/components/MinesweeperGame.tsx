// components/MinesweeperGame.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

import MinesCounterDisplay from '../components/MinesCounterDisplay';
import GameTimerDisplay from '../components/GameTimerDisplay';

// Import all constants from the new config file
import {
  CELL_NATIVE_PX,
  GAP_NATIVE_PX,
  BASE_MINE_DENSITY,
  GAME_SIZES,
  SIZE_THRESHOLDS,
  MINE_VALUE,
  UNOPENED_DISPLAY,
  FLAGGED_DISPLAY,
  EXPLODED_MINE_DISPLAY,
  WRONG_FLAG_DISPLAY,
  UNEXPLODED_MINE_DISPLAY,
  DOUBLE_CLICK_PREVIEW_DISPLAY,
  REVEALED_ZERO_DISPLAY,
  MAX_TIME,
} from './constants/gameConfig'; // Adjust path if needed

// --- Types ---
type Grid = number[][];
type RevealedGrid = boolean[][];
type FlaggedGrid = boolean[][];
type DisplayGrid = string[][];

// --- Initial Grid States (moved outside component to be reusable) ---
const createEmptyGrid = <T,>(rows: number, cols: number, fillValue: T): T[][] => {
  if (rows <= 0 || cols <= 0) return []; // Handle initial 0 values safely
  return Array(rows)
    .fill(0)
    .map(() => Array(cols).fill(fillValue));
};

const createInitialDisplayGrid = (rows: number, cols: number): DisplayGrid => {
  return createEmptyGrid(rows, cols, UNOPENED_DISPLAY);
};

// --- Minesweeper Game Component ---
const MinesweeperGame: React.FC = () => {
  // Game State - now dynamic
  const [rows, setRows] = useState(0); // Initialize with 0, will be set by useEffect
  const [cols, setCols] = useState(0); // Initialize with 0, will be set by useEffect
  const [minesCount, setMinesCount] = useState(0); // Initialize with 0, will be set by useEffect

  const [grid, setGrid] = useState<Grid>([]);
  const [revealedGrid, setRevealedGrid] = useState<RevealedGrid>([]);
  const [flaggedGrid, setFlaggedGrid] = useState<FlaggedGrid>([]);
  const [displayGrid, setDisplayGrid] = useState<DisplayGrid>([]);

  const [isGameStarted, setIsGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  // const [gameWon, setGameWon] = useState(false); // Make sure this line exists and is correct
  const [win, setWin] = useState(false);
  const [minesLeft, setMinesLeft] = useState(0);
  // const [smileyFace, setSmileyFace] = useState<'normal' | 'victory' | 'loss'>('normal');
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // For scaling the entire game board
  const [scaleFactor, setScaleFactor] = useState(1);
  // Ref to accurately measure the header's height (mines, smiley, timer)
  const headerRef = useRef<HTMLDivElement>(null);

  // Click Tracking (for strict left/right/double clicks)
  const clicksDown = useRef({ left: false, right: false });
  const doubleClickTimeout = useRef<NodeJS.Timeout | null>(null);
  const tempDisplayGrid = useRef<DisplayGrid | null>(null);

  // --- REFS FOR LATEST STATE (Crucial for correct closure behavior in callbacks) ---
  const revealedGridRef = useRef<RevealedGrid>(revealedGrid);
  const flaggedGridRef = useRef<FlaggedGrid>(flaggedGrid);
  const displayGridRef = useRef<DisplayGrid>(displayGrid);
  const gridRef = useRef<Grid>(grid);

  // NEW PART
  // --- Render only once rows/cols/minesCount are initialized ---
  // if (rows === 0 || cols === 0 || minesCount === 0) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen bg-gray-100">
  //       Loading Minesweeper...
  //     </div>
  //   );
  // }

  // Recalculate nativeGameWidth based on the new, simpler structure
  // The grid's content width: (cols * CELL_NATIVE_PX) + ((cols - 1) * GAP_NATIVE_PX)
  // The border for the combined header/grid container: Let's assume a total of 4px border on each side for the outer grey section.
  // The main game wrapper's padding: 16px (p-4)
  const GRID_CELL_AREA_WIDTH = (cols * CELL_NATIVE_PX) + ((cols - 1) * GAP_NATIVE_PX);

  // The combined header/grid container (the `bg-[#cacac4]` area) will have a border,
  // let's assume `border-[4px]` for consistency with the outer grey frame.
  // So, its content area needs to be `GRID_CELL_AREA_WIDTH`.
  // Its total width will be `GRID_CELL_AREA_WIDTH + (4 * 2)`.
  const GAME_INNER_GREY_SECTION_WIDTH = GRID_CELL_AREA_WIDTH + (4 * 2); // 4px border on left/right for this section

  // The very outermost `bg-gray-100` div has `p-4` (16px) padding.
  const nativeGameWidth = GAME_INNER_GREY_SECTION_WIDTH + (16 * 2); // Add outer padding

  useEffect(() => { revealedGridRef.current = revealedGrid; }, [revealedGrid]);
  useEffect(() => { flaggedGridRef.current = flaggedGrid; }, [flaggedGrid]);
  useEffect(() => { displayGridRef.current = displayGrid; }, [displayGrid]);
  useEffect(() => { gridRef.current = grid; }, [grid]);
  // --- END REFS FOR LATEST STATE ---

  // --- Dynamic Grid Sizing and Scaling Logic ---
  const calculateGameDimensionsAndScale = useCallback(() => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // 1. Determine optimal ROWS and COLS based on screen size thresholds
    let selectedConfig = GAME_SIZES[0]; // Start with the smallest default
    for (let i = GAME_SIZES.length - 1; i >= 0; i--) { // Iterate backwards to find largest matching config
        const config = GAME_SIZES[i];
        if (screenWidth >= SIZE_THRESHOLDS[config.id]) {
            selectedConfig = config;
            break;
        }
    }

    const newRows = selectedConfig.rows;
    const newCols = selectedConfig.cols;
    // Ensure at least 1 mine, but use Math.round for better distribution
    const newMinesCount = Math.max(1, Math.round(BASE_MINE_DENSITY * newRows * newCols));

    // Update state. This will trigger a re-render and re-initialization.
    setRows(newRows);
    setCols(newCols);
    setMinesCount(newMinesCount);

    // Re-initialize game state with new dimensions
    setGrid(createEmptyGrid(newRows, newCols, 0));
    setRevealedGrid(createEmptyGrid(newRows, newCols, false));
    setFlaggedGrid(createEmptyGrid(newRows, newCols, false));
    setDisplayGrid(createInitialDisplayGrid(newRows, newCols));
    setIsGameStarted(false);
    setGameOver(false);
    setWin(false);
    setMinesLeft(newMinesCount);
    // setSmileyFace('normal');
    setSecondsElapsed(0);
    clicksDown.current = { left: false, right: false };
    if (doubleClickTimeout.current) {
      clearTimeout(doubleClickTimeout.current);
      doubleClickTimeout.current = null;
    }
    tempDisplayGrid.current = null;

    // 2. Calculate scaling factor for the entire game board
    // Get the actual height of the header for accurate scaling
    const actualHeaderHeight = headerRef.current ? headerRef.current.offsetHeight : 60; // Fallback to 60px if ref not available yet

    // Calculate the native pixel dimensions of the game grid part
    const nativeGridWidth = (newCols * CELL_NATIVE_PX) + ((newCols - 1) * GAP_NATIVE_PX);
    const nativeGridHeight = (newRows * CELL_NATIVE_PX) + ((newRows - 1) * GAP_NATIVE_PX);

    // Total native dimensions of the entire game UI (grid + header + outer padding)
    // Adjust 8px padding from the inner div: `p-4` means 16px padding.
    // If the inner div has `p-4` (16px) and the outer has `p-2` (8px), the content area is 16*2=32px smaller than the outer container.
    // Let's re-evaluate based on the structure. The main container has `p-4` (16px on each side).
    // The top div (mines/smiley/timer) has `pt-1 px-3` (4px top, 12px horizontal).
    // The grid container has `p-2` (8px), and inner `border-4` (4px).
    // It's better to calculate based on the actual internal structure.

    // Let's assume the overall game container (the one directly under the scaling wrapper)
    // has an effective internal padding that makes its content area (mines/timer + grid) smaller.
    // Based on your original structure:
    // Outermost game div has `p-4` (16px top/bottom, 16px left/right)
    // Inner div has `bg-[#cacac4] border-4 border-[#cacac4] p-2`
    // This padding/border structure is complex for precise calculation.
    // Let's simplify for calculation: The entire visible game area (header + grid)
    // will be scaled together.
    const overallNativeWidthEstimate = nativeGridWidth + (16 * 2); // 16px padding on left/right for the outermost flex div
    const overallNativeHeightEstimate = nativeGridHeight + actualHeaderHeight + (16 * 2); // 16px padding on top/bottom

    // Target to fill 80% of screen (or any desired percentage, e.g., 0.9 for 90%)
    const targetPercentage = 0.8;
    const targetWidth = screenWidth * targetPercentage;
    const targetHeight = screenHeight * targetPercentage;

    // Calculate potential scale factors for both dimensions
    const scaleX = targetWidth / overallNativeWidthEstimate;
    const scaleY = targetHeight / overallNativeHeightEstimate;

    // Use the smaller scale factor to ensure the entire game fits within the target area
    let newScale = Math.min(scaleX, scaleY);

    // Clamp the scale to reasonable min/max values to prevent it from becoming too small or too large
    // e.g., min 0.5x, max 2.5x. Adjust these values as per your aesthetic preference.
    const CLAMP_MIN_SCALE = 0.5;
    const CLAMP_MAX_SCALE = 2.5;
    newScale = Math.min(CLAMP_MAX_SCALE, Math.max(CLAMP_MIN_SCALE, newScale));

    setScaleFactor(newScale);

  }, []); // Dependencies are removed because `rows`, `cols`, `minesCount` are set inside and don't need to be read from state

  // Effect to calculate dimensions on mount and resize
  useEffect(() => {
    // Initial calculation after headerRef is likely available
    const timeoutId = setTimeout(() => { // Use a small timeout to allow headerRef to be measured
      calculateGameDimensionsAndScale();
    }, 50);

    const handleResize = () => {
      // Debounce resize to prevent too many calls during rapid resizing
      clearTimeout(timeoutId); // Clear previous timeout if resize happens quickly
      setTimeout(() => {
        calculateGameDimensionsAndScale();
      }, 100); // Wait 100ms after resize stops
    };

    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeoutId); // Cleanup on unmount
      window.removeEventListener('resize', handleResize);
    };
  }, [calculateGameDimensionsAndScale]);

  // --- Timer Logic (already adapted in previous response) ---
  const timerIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isTabActiveRef = useRef(true);

  const updateTimerState = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = undefined;
    }
    if (isGameStarted && !gameOver && !win && isTabActiveRef.current) {
      timerIntervalRef.current = setInterval(() => {
        setSecondsElapsed(prev => {
          const newTime = prev + 1;
          if (newTime >= MAX_TIME) {
            setGameOver(true);
            // setSmileyFace('loss');
            // console.log("Game Over! Time ran out!");
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = undefined;
            }
            return MAX_TIME;
          }
          return newTime;
        });
      }, 1000);
    }
  }, [isGameStarted, gameOver, win, MAX_TIME]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      isTabActiveRef.current = document.visibilityState === 'visible';
      updateTimerState();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    updateTimerState();
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = undefined;
      }
    };
  }, [updateTimerState]);

  // --- Game Logic Functions (updated to use dynamic `rows`, `cols`, `minesCount` state) ---
  const generateMinefield = useCallback((clickRow: number, clickCol: number): Grid => {
    const newGrid = createEmptyGrid(rows, cols, 0); // Use dynamic rows/cols
    const safeSpots = new Set<string>();

    for (let r = Math.max(0, clickRow - 1); r <= Math.min(rows - 1, clickRow + 1); r++) {
      for (let c = Math.max(0, clickCol - 1); c <= Math.min(cols - 1, clickCol + 1); c++) {
        safeSpots.add(`${r},${c}`);
      }
    }

    let minesPlaced = 0;
    while (minesPlaced < minesCount) { // Use dynamic minesCount
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);

      if (newGrid[r][c] !== MINE_VALUE && !safeSpots.has(`${r},${c}`)) {
        newGrid[r][c] = MINE_VALUE;
        minesPlaced++;
      }
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (newGrid[r][c] !== MINE_VALUE) {
          newGrid[r][c] = countNeighborMines(r, c, newGrid);
        }
      }
    }
    return newGrid;
  }, [rows, cols, minesCount]); // Dependencies must include dynamic states

  const countNeighborMines = (r: number, c: number, currentGrid: Grid): number => {
    let mineCount = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && currentGrid[nr][nc] === MINE_VALUE) { // Use dynamic rows/cols
          mineCount++;
        }
      }
    }
    return mineCount;
  };

  const revealSquare = useCallback(
    (r: number, c: number, currentRevealedGrid: RevealedGrid, currentDisplayGrid: DisplayGrid, currentFlaggedGrid: FlaggedGrid, actualGrid: Grid): { newRevealedGrid: RevealedGrid; newDisplayGrid: DisplayGrid } => {
      const newRevealedGrid = currentRevealedGrid.map((row) => [...row]);
      const newDisplayGrid = currentDisplayGrid.map((row) => [...row]);
      const queue: [number, number][] = [[r, c]];
      const visited = new Set<string>();

      while (queue.length > 0) {
        const [currR, currC] = queue.shift()!;
        const key = `${currR},${currC}`;

        if (visited.has(key)) continue;
        visited.add(key);

        if (currR < 0 || currR >= rows || currC < 0 || currC >= cols || newRevealedGrid[currR][currC] || currentFlaggedGrid[currR][currC]) { // Use dynamic rows/cols
          continue;
        }

        newRevealedGrid[currR][currC] = true;
        newDisplayGrid[currR][currC] = actualGrid[currR][currC] === 0 ? REVEALED_ZERO_DISPLAY : String(actualGrid[currR][currC]);

        if (actualGrid[currR][currC] === 0) {
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue;
              const nr = currR + dr;
              const nc = currC + dc;
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !newRevealedGrid[nr][nc] && !currentFlaggedGrid[nr][nc]) { // Use dynamic rows/cols
                queue.push([nr, nc]);
              }
            }
          }
        }
      }
      return { newRevealedGrid, newDisplayGrid };
    },
    [rows, cols] // Dependencies must include dynamic states
  );

  const handleGameOver = useCallback(
    (explodedRow: number, explodedCol: number) => {
      setGameOver(true);
      // setSmileyFace('loss');
      const newDisplayGrid = displayGridRef.current.map((row) => [...row]);

      for (let r = 0; r < rows; r++) { // Use dynamic rows/cols
        for (let c = 0; c < cols; c++) {
          if (r === explodedRow && c === explodedCol) {
            newDisplayGrid[r][c] = EXPLODED_MINE_DISPLAY;
          } else if (flaggedGridRef.current[r][c] && gridRef.current[r][c] !== MINE_VALUE) {
            newDisplayGrid[r][c] = WRONG_FLAG_DISPLAY;
          } else if (!flaggedGridRef.current[r][c] && gridRef.current[r][c] === MINE_VALUE) {
            newDisplayGrid[r][c] = UNEXPLODED_MINE_DISPLAY;
          }
        }
      }
      setDisplayGrid(newDisplayGrid);
    },
    [rows, cols] // Dependencies must include dynamic states
  );

  const checkWinCondition = useCallback(() => {
    if (gameOver || win) return;

    let revealedNonMinesCount = 0;
    let correctlyFlaggedMinesCount = 0;
    let incorrectlyFlaggedSquaresCount = 0;
    let unopenedSquaresCount = 0;

    for (let r = 0; r < rows; r++) { // Use dynamic rows/cols
      for (let c = 0; c < cols; c++) {
        if (revealedGridRef.current[r][c] && gridRef.current[r][c] !== MINE_VALUE) {
          revealedNonMinesCount++;
        }
        if (flaggedGridRef.current[r][c]) {
          if (gridRef.current[r][c] === MINE_VALUE) {
            correctlyFlaggedMinesCount++;
          } else {
            incorrectlyFlaggedSquaresCount++;
          }
        }
        if (!revealedGridRef.current[r][c] && !flaggedGridRef.current[r][c]) {
          unopenedSquaresCount++;
        }
      }
    }

    const allNonMinesRevealed = revealedNonMinesCount === (rows * cols - minesCount); // Use dynamic rows/cols/minesCount
    const allFlagsCorrectAndAllMinesFlagged =
      minesLeft === 0 && correctlyFlaggedMinesCount === minesCount && incorrectlyFlaggedSquaresCount === 0; // Use dynamic minesCount
    const unopenedMatchesMinesLeft = unopenedSquaresCount === minesLeft;

    let winTriggered = false;
    let winType: 'revealed' | 'flags' | 'unopened' | null = null;

    if (allNonMinesRevealed) {
        winTriggered = true;
        winType = 'revealed';
    } else if (allFlagsCorrectAndAllMinesFlagged) {
        winTriggered = true;
        winType = 'flags';
    } else if (unopenedMatchesMinesLeft) {
        winTriggered = true;
        winType = 'unopened';
    }

    if (winTriggered) {
      setWin(true);
      setGameOver(true);
      // setSmileyFace('victory');
      setMinesLeft(0);

      const finalDisplayGrid = displayGridRef.current.map(row => [...row]);
      if (winType === 'revealed' || winType === 'flags') {
        for (let r = 0; r < rows; r++) { // Use dynamic rows/cols
          for (let c = 0; c < cols; c++) {
            if (gridRef.current[r][c] === MINE_VALUE && !flaggedGridRef.current[r][c]) {
              finalDisplayGrid[r][c] = FLAGGED_DISPLAY;
            }
          }
        }
      }
      setDisplayGrid(finalDisplayGrid);
    }
  }, [gameOver, win, minesLeft, minesCount, rows, cols]); // Dependencies must include dynamic states

  useEffect(() => {
    if (isGameStarted && !gameOver && !win && rows > 0 && cols > 0) { // Add checks for rows/cols being set
      checkWinCondition();
    }
  }, [isGameStarted, gameOver, win, checkWinCondition, revealedGrid, flaggedGrid, minesLeft, rows, cols]);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLImageElement>) => {
      if (event.button === 2) {
        event.preventDefault();
      }

      if (gameOver || win) return; // Grid is not clickable if game is over or won

      if (event.button === 0) {
        clicksDown.current.left = true;
      } else if (event.button === 2) {
        clicksDown.current.right = true;
      }

      if (clicksDown.current.left && clicksDown.current.right) {
        const target = event.target as HTMLElement;
        const row = parseInt(target.dataset.row || '');
        const col = parseInt(target.dataset.col || '');

        if (isNaN(row) || isNaN(col)) return;

        // Use refs for the latest state checks
        if (revealedGridRef.current[row][col] && gridRef.current[row][col] > 0 && gridRef.current[row][col] < MINE_VALUE) {
          let neighborFlags = 0;
          const newTempDisplayGrid = displayGridRef.current.map(r => [...r]);

          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue;
              const nr = row + dr;
              const nc = col + dc;

              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                if (flaggedGridRef.current[nr][nc]) { // Use ref
                  neighborFlags++;
                } else if (!revealedGridRef.current[nr][nc] && gridRef.current[row][col] !== neighborFlags) { // Use refs
                  newTempDisplayGrid[nr][nc] = DOUBLE_CLICK_PREVIEW_DISPLAY;
                }
              }
            }
          }
          tempDisplayGrid.current = newTempDisplayGrid;
          setDisplayGrid(newTempDisplayGrid);
        }
      }
    },
    [gameOver, win] // Dependencies are minimal as most state is accessed via refs
  );

  const handleMouseUp = useCallback(
    (event: React.MouseEvent<HTMLImageElement>) => {
      const target = event.target as HTMLElement;
      const row = parseInt(target.dataset.row || '');
      const col = parseInt(target.dataset.col || '');

      if (isNaN(row) || isNaN(col)) return;

      // Restore display grid from temp if it was used for D.svg preview
      if (tempDisplayGrid.current) {
        const currentDisplay = createEmptyGrid(rows, cols, '');
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (gameOver || win) {
                    currentDisplay[r][c] = displayGridRef.current[r][c]; // Use ref
                } else if (revealedGridRef.current[r][c]) { // Use ref
                    currentDisplay[r][c] = gridRef.current[r][c] === 0 ? REVEALED_ZERO_DISPLAY : String(gridRef.current[r][c]); // Use ref
                } else if (flaggedGridRef.current[r][c]) { // Use ref
                    currentDisplay[r][c] = FLAGGED_DISPLAY;
                } else {
                    currentDisplay[r][c] = UNOPENED_DISPLAY;
                }
            }
        }
        setDisplayGrid(currentDisplay);
        tempDisplayGrid.current = null;
      }

      if (gameOver || win) { // Grid is not clickable if game is over or won
        clicksDown.current = { left: false, right: false };
        return;
      }

      const isStrictLeftClick = clicksDown.current.left && !clicksDown.current.right;
      const isStrictRightClick = !clicksDown.current.left && clicksDown.current.right;
      const isDoubleClick = clicksDown.current.left && clicksDown.current.right;

      clicksDown.current = { left: false, right: false };

      if (isDoubleClick) {
        if (!revealedGridRef.current[row][col] || gridRef.current[row][col] === MINE_VALUE) { // Use refs
          return;
        }

        let neighborFlags = 0;
        const unrevealedNeighbors: [number, number][] = [];
        // Create new copies from the refs for working within this scope
        let updatedRevealedGrid = revealedGridRef.current.map(row => [...row]);
        let updatedDisplayGrid = displayGridRef.current.map(row => [...row]);
        let mineHitDuringDouble = false;

        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = row + dr;
            const nc = col + dc;

            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
              if (flaggedGridRef.current[nr][nc]) { // Use ref
                neighborFlags++;
              } else if (!updatedRevealedGrid[nr][nc]) { // Use the grid being built
                unrevealedNeighbors.push([nr, nc]);
              }
            }
          }
        }

        if (neighborFlags === gridRef.current[row][col]) { // Use ref
          for (const [nr, nc] of unrevealedNeighbors) {
            if (gridRef.current[nr][nc] === MINE_VALUE) { // Use ref
              mineHitDuringDouble = true;
              handleGameOver(nr, nc);
              break;
            }
            const { newRevealedGrid: tempR, newDisplayGrid: tempD } = revealSquare(
              nr,
              nc,
              updatedRevealedGrid,
              updatedDisplayGrid,
              flaggedGridRef.current, // Use ref
              gridRef.current // Use ref
            );
            updatedRevealedGrid = tempR;
            updatedDisplayGrid = tempD;
          }

          if (!mineHitDuringDouble) {
            setRevealedGrid(updatedRevealedGrid);
            setDisplayGrid(updatedDisplayGrid);
          }

        }
      } else if (isStrictLeftClick) {
        // Left click logic
        if (flaggedGridRef.current[row][col]) { // Use ref
          return;
        }

        if (!isGameStarted) {
          setIsGameStarted(true);
          const newActualGrid = generateMinefield(row, col);
          setGrid(newActualGrid); // This will update gridRef in useEffect
          // Use the _initial_ state for first revelation, and newActualGrid for minefield
          const { newRevealedGrid, newDisplayGrid } = revealSquare(
            row,
            col,
            revealedGridRef.current, // Use ref for initial state
            displayGridRef.current,  // Use ref for initial state
            flaggedGridRef.current,  // Use ref for initial state
            newActualGrid // Pass the newly generated grid
          );
          setRevealedGrid(newRevealedGrid);
          setDisplayGrid(newDisplayGrid);
        } else {
          // Subsequent left clicks
          if (revealedGridRef.current[row][col]) { // Use ref
            return;
          }

          if (gridRef.current[row][col] === MINE_VALUE) { // Use ref
            handleGameOver(row, col);
          } else {
            const { newRevealedGrid, newDisplayGrid } = revealSquare(
              row,
              col,
              revealedGridRef.current, // Use ref for latest state
              displayGridRef.current,  // Use ref for latest state
              flaggedGridRef.current,  // Use ref for latest state
              gridRef.current          // Use ref for latest grid
            );
            setRevealedGrid(newRevealedGrid);
            setDisplayGrid(newDisplayGrid);
          }
        }
      } else if (isStrictRightClick) {
        if (revealedGridRef.current[row][col]) { // Use ref
          return;
        }

        // Create new copies from the refs for working within this scope
        const newFlaggedGrid = flaggedGridRef.current.map((r) => [...r]);
        const newDisplayGrid = displayGridRef.current.map((r) => [...r]);

        if (newFlaggedGrid[row][col]) {
          newFlaggedGrid[row][col] = false;
          newDisplayGrid[row][col] = UNOPENED_DISPLAY;
          setMinesLeft((prev) => prev + 1);
        } else {
          if (minesLeft === 0) {
            return;
          }
          newFlaggedGrid[row][col] = true;
          newDisplayGrid[row][col] = FLAGGED_DISPLAY;
          setMinesLeft((prev) => prev - 1);
        }
        setFlaggedGrid(newFlaggedGrid);
        setDisplayGrid(newDisplayGrid);
      }
    },
    [
      gameOver,
      win,
      isGameStarted,
      minesLeft, // This needs to be a dependency because `minesLeft === 0` is read directly
      generateMinefield,
      revealSquare,
      handleGameOver,
    ]
  );

  // --- Reset Game Function (updated to use dynamic `minesCount`) ---
  const resetGame = useCallback(() => {
    // Use the current dynamic rows/cols/minesCount for reset
    setGrid(createEmptyGrid(rows, cols, 0));
    setRevealedGrid(createEmptyGrid(rows, cols, false));
    setFlaggedGrid(createEmptyGrid(rows, cols, false));
    setDisplayGrid(createInitialDisplayGrid(rows, cols));
    setIsGameStarted(false);
    setGameOver(false);
    setWin(false);
    setMinesLeft(minesCount); // Reset to the current calculated minesCount
    // setSmileyFace('normal');
    setSecondsElapsed(0);
    clicksDown.current = { left: false, right: false };
    if (doubleClickTimeout.current) {
      clearTimeout(doubleClickTimeout.current);
      doubleClickTimeout.current = null;
    }
    tempDisplayGrid.current = null;
  }, [rows, cols, minesCount]); // Dependencies must include dynamic states

  // Determine which smiley SVG to display
  // const getSmileySrc = () => {
  //   if (win) { return '/svg/victory.svg'; }
  //   else if (gameOver) { return '/svg/loss.svg'; }
  //   else { return '/svg/normal.svg'; }
  // };

  const getSmileySrc = useCallback(() => {
    if (win) { // Check win condition first
      return '/svg/victory.svg';
    } else if (gameOver) { // Then check if game is over (and not a win, implicitly)
      return '/svg/loss.svg';
    }
    // If neither win nor gameOver, it's a normal, ongoing game
    return '/svg/normal.svg';
  }, [gameOver, win]); // Dependencies remain correct

  // Helper for SVG paths
  const getSvgPath = (value: string): string => {
    return `/svg/${value}.svg`;
  };

  // Render only once rows/cols/minesCount are initialized
  if (rows === 0 || cols === 0 || minesCount === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        Loading Minesweeper...
      </div>
    );
  }

  // Calculate native width/height of the game area for centering
  // const nativeGameWidth = (cols * CELL_NATIVE_PX) + ((cols - 1) * GAP_NATIVE_PX) + (16 * 2); // Board width + outer padding
  // const nativeGameHeight = (rows * CELL_NATIVE_PX) + ((rows - 1) * GAP_NATIVE_PX) + (headerRef.current?.offsetHeight || 60) + (16 * 2); // Board height + header + outer padding

  return (
    <div 
      // className='bg-[#3D8E86]'
      style={{
        transform: `scale(${scaleFactor})`,
        transformOrigin: 'center center',
      }}
    >
      {/* This is the main game wrapper that defines the overall size and has the `p-4 bg-gray-100` */}
      <div
        className="flex flex-col items-center p-4 font-sans"
        style={{
          width: `${nativeGameWidth}px`, // Use the newly calculated width
        }}
      >
        {/* This new div acts as the container for both header AND grid, giving them a unified border/background */}
        <div className="flex flex-col bg-[#cacac4] px-2 pb-2"> {/* This border will create the desired outer look */}
  
          {/* CONTROL PANEL (Header) - Remove its individual border, adjust padding */}
          <div
            ref={headerRef}
            className='flex justify-between w-full h-fit items-center py-2' // No px-3 or pt-3/pb-1 directly here
          >
              <div className="text-lg font-semibold text-gray-700 bg-slate-800">
                <MinesCounterDisplay value={minesLeft} />
              </div>
  
              {/* Smiley button - Keep its own border for its 3D effect */}
              <div className='border-[6px] border-l-[#e8e8de] border-t-[#e8e8de] border-b-[#848480] border-r-[#848480]
                                  hover:border-l-[#848480] hover:border-t-[#848480] hover:border-b-[#e8e8de] hover:border-r-[#e8e8de] h-fit'>
                <Image
                  src={getSmileySrc()}
                  alt="Smiley Face"
                  width={32}
                  height={32}
                  className='w-12 cursor-pointer'
                  onClick={resetGame}
                />
              </div>
  
              <div className="text-lg font-semibold text-gray-700 bg-slate-800">
                <GameTimerDisplay value={secondsElapsed} />
              </div>
          </div>
  
          {/* A line to separate header and grid, visually consistent with old Minesweeper */}
          {/* This creates the dark horizontal line you see in Goal.png below the header. */}
          {/* <div className="w-full h-[3px] bg-[#848480] border-t-[1px] border-t-[#e8e8de] my-1"></div> */}
  
          {/* MAIN GAME BOARD (Grid) - Simplify its wrappers */}
          {/* Remove `border-4 border-[#cacac4] p-2` from here. It's now handled by the parent `bg-[#cacac4]` div. */}
          {/* Only keep the inner border for the grid itself. */}
          {/* <div className="border-[4px] border-t-[#e8e8de] border-l-[#e8e8de] border-b-[#848480] border-r-[#848480] bg-[#e8e8de]"> */}
          <div className="border-[4px] border-[#e8e8de] bg-[#e8e8de]">
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${cols}, ${CELL_NATIVE_PX}px)`,
                  gridTemplateRows: `repeat(${rows}, ${CELL_NATIVE_PX}px)`,
                  gap: `${GAP_NATIVE_PX}px`,
                  // This transparent border adds an effective 1px padding around the cells
                  border: `${GAP_NATIVE_PX}px solid transparent`,
                }}
              >
                {displayGrid.map((row, rowIndex) =>
                  row.map((displayValue, colIndex) => (
                    <img
                      key={`${rowIndex}-${colIndex}`}
                      src={getSvgPath(displayValue)}
                      alt={`Square at ${rowIndex},${colIndex}: ${displayValue}`}
                      width={CELL_NATIVE_PX}
                      height={CELL_NATIVE_PX}
                      className="block select-none"
                      data-row={rowIndex}
                      data-col={colIndex}
                      onMouseDown={handleMouseDown}
                      onMouseUp={handleMouseUp}
                      onContextMenu={handleMouseDown}
                    />
                  ))
                )}
              </div>
          </div>
        </div> {/* End of new `bg-[#cacac4]` container */}
      </div>
    </div>
  );
};

export default MinesweeperGame;