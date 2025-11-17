import { useState } from "react";
import { TopNav } from "../components/TopNav";
import { GlassCard } from "../components/GlassCard";
import { Button } from "../components/ui/button";
import { Play, RotateCcw, Eraser } from "lucide-react";

export function Sudoku() {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  
  // Simple 9x9 sudoku grid (0 means empty)
  const [grid, setGrid] = useState<number[][]>([
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
  ]);
  
  const [initialGrid, setInitialGrid] = useState<number[][]>(grid.map(row => [...row]));
  
  const handleStart = () => {
    setIsPlaying(true);
    setInitialGrid(grid.map(row => [...row]));
  };
  
  const handleCellClick = (row: number, col: number) => {
    if (!isPlaying) return;
    if (initialGrid[row][col] !== 0) return; // Can't change initial numbers
    
    setSelectedCell({ row, col });
  };
  
  const handleNumberInput = (num: number) => {
    if (!selectedCell) return;
    
    const newGrid = grid.map(row => [...row]);
    newGrid[selectedCell.row][selectedCell.col] = num;
    setGrid(newGrid);
  };
  
  const handleErase = () => {
    if (!selectedCell) return;
    if (initialGrid[selectedCell.row][selectedCell.col] !== 0) return;
    
    const newGrid = grid.map(row => [...row]);
    newGrid[selectedCell.row][selectedCell.col] = 0;
    setGrid(newGrid);
  };
  
  const isInSameRow = (row: number) => selectedCell?.row === row;
  const isInSameCol = (col: number) => selectedCell?.col === col;
  const isInSameBox = (row: number, col: number) => {
    if (!selectedCell) return false;
    const boxRow = Math.floor(selectedCell.row / 3);
    const boxCol = Math.floor(selectedCell.col / 3);
    return Math.floor(row / 3) === boxRow && Math.floor(col / 3) === boxCol;
  };
  
  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <TopNav title="数独挑战" showBack />
      
      <main className="px-6 py-6 max-w-md mx-auto space-y-6 safe-bottom">
        {/* Difficulty Selector */}
        {!isPlaying && (
          <GlassCard>
            <p className="caption mb-3">选择难度</p>
            <div className="grid grid-cols-3 gap-3">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`py-3 rounded-xl transition-all ${
                    difficulty === level
                      ? 'bg-[rgb(var(--primary))] text-white'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {level === 'easy' ? '简单' : level === 'medium' ? '中等' : '困难'}
                </button>
              ))}
            </div>
          </GlassCard>
        )}
        
        {/* Sudoku Grid */}
        <GlassCard className="overflow-hidden">
          <div className="grid grid-cols-9 gap-0">
            {grid.map((row, rowIndex) => 
              row.map((cell, colIndex) => {
                const isInitial = initialGrid[rowIndex][colIndex] !== 0;
                const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                const isHighlighted = isInSameRow(rowIndex) || isInSameCol(colIndex) || isInSameBox(rowIndex, colIndex);
                const isRightBorder = (colIndex + 1) % 3 === 0 && colIndex !== 8;
                const isBottomBorder = (rowIndex + 1) % 3 === 0 && rowIndex !== 8;
                
                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    disabled={!isPlaying}
                    className={`aspect-square flex items-center justify-center text-lg transition-all ${
                      isSelected 
                        ? 'bg-[rgb(var(--primary))] text-white' 
                        : isHighlighted
                          ? 'bg-[rgb(var(--primary))]/10'
                          : 'bg-white/5 hover:bg-white/10'
                    } ${
                      isInitial ? 'font-bold' : 'text-[rgb(var(--muted-foreground))]'
                    } ${
                      isRightBorder ? 'border-r-2 border-white/20' : 'border-r border-white/5'
                    } ${
                      isBottomBorder ? 'border-b-2 border-white/20' : 'border-b border-white/5'
                    } ${
                      !isPlaying ? 'opacity-50' : ''
                    }`}
                  >
                    {cell !== 0 ? cell : ''}
                  </button>
                );
              })
            )}
          </div>
        </GlassCard>
        
        {/* Number Pad */}
        {isPlaying && (
          <GlassCard>
            <div className="grid grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumberInput(num)}
                  disabled={!selectedCell || initialGrid[selectedCell.row][selectedCell.col] !== 0}
                  className="aspect-square rounded-xl bg-[rgb(var(--card-elevated))] hover:bg-[rgb(var(--primary))] hover:text-white transition-all text-xl disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleErase}
                disabled={!selectedCell || initialGrid[selectedCell?.row][selectedCell?.col] !== 0}
                className="aspect-square rounded-xl bg-red-500/20 hover:bg-red-500 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center"
              >
                <Eraser className="w-5 h-5" />
              </button>
            </div>
          </GlassCard>
        )}
        
        {/* Controls */}
        <div className="flex gap-3">
          {!isPlaying ? (
            <Button 
              onClick={handleStart}
              className="flex-1 h-14 gradient-primary glow-primary"
            >
              <Play className="w-5 h-5 mr-2" />
              开始游戏
            </Button>
          ) : (
            <Button 
              onClick={() => setIsPlaying(false)}
              variant="outline"
              className="flex-1 h-14 border-white/10"
            >
              暂停
            </Button>
          )}
          <Button 
            onClick={() => {
              setGrid(initialGrid.map(row => [...row]));
              setSelectedCell(null);
            }}
            variant="outline"
            className="h-14 w-14 border-white/10"
            size="icon"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Instructions */}
        {!isPlaying && (
          <GlassCard>
            <h4 className="mb-3">游戏说明</h4>
            <ul className="space-y-2 text-sm text-secondary">
              <li>• 每行、每列都要包含数字 1-9</li>
              <li>• 每个 3×3 宫格也要包含数字 1-9</li>
              <li>• 加粗的数字是初始数字，不能修改</li>
              <li>• 点击格子后使用数字键盘输入</li>
            </ul>
          </GlassCard>
        )}
      </main>
    </div>
  );
}