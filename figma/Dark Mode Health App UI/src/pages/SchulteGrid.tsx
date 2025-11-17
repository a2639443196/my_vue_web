import { useState, useEffect } from "react";
import { TopNav } from "../components/TopNav";
import { GlassCard } from "../components/GlassCard";
import { Button } from "../components/ui/button";
import { Play, RotateCcw, Trophy } from "lucide-react";

export function SchulteGrid() {
  const [difficulty, setDifficulty] = useState<4 | 5 | 6>(5);
  const [grid, setGrid] = useState<number[]>([]);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  
  useEffect(() => {
    generateGrid();
  }, [difficulty]);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, startTime]);
  
  const generateGrid = () => {
    const size = difficulty * difficulty;
    const numbers = Array.from({ length: size }, (_, i) => i + 1);
    const shuffled = numbers.sort(() => Math.random() - 0.5);
    setGrid(shuffled);
    setCurrentNumber(1);
    setIsPlaying(false);
    setStartTime(null);
    setElapsedTime(0);
  };
  
  const handleStart = () => {
    generateGrid();
    setIsPlaying(true);
    setStartTime(Date.now());
  };
  
  const handleCellClick = (num: number) => {
    if (!isPlaying) return;
    
    if (num === currentNumber) {
      if (num === difficulty * difficulty) {
        // Game complete
        setIsPlaying(false);
        const finalTime = elapsedTime;
        if (!bestTime || finalTime < bestTime) {
          setBestTime(finalTime);
        }
      } else {
        setCurrentNumber(prev => prev + 1);
      }
    }
  };
  
  const formatTime = (ms: number) => {
    return (ms / 1000).toFixed(2);
  };
  
  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <TopNav title="舒尔特方格" showBack />
      
      <main className="px-6 py-6 max-w-md mx-auto space-y-6 safe-bottom">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <GlassCard className="text-center">
            <div className="caption mb-1">当前数字</div>
            <div className="text-2xl text-[rgb(var(--primary))]">{currentNumber}</div>
          </GlassCard>
          <GlassCard className="text-center">
            <div className="caption mb-1">用时</div>
            <div className="text-2xl text-[rgb(var(--accent))]">{formatTime(elapsedTime)}s</div>
          </GlassCard>
          <GlassCard className="text-center">
            <div className="caption mb-1">最佳</div>
            <div className="text-2xl text-yellow-400">
              {bestTime ? `${formatTime(bestTime)}s` : '-'}
            </div>
          </GlassCard>
        </div>
        
        {/* Difficulty Selector */}
        <GlassCard>
          <p className="caption mb-3">选择难度</p>
          <div className="grid grid-cols-3 gap-3">
            {[4, 5, 6].map((size) => (
              <button
                key={size}
                onClick={() => {
                  setDifficulty(size as 4 | 5 | 6);
                  setIsPlaying(false);
                }}
                disabled={isPlaying}
                className={`py-3 rounded-xl transition-all ${
                  difficulty === size
                    ? 'bg-[rgb(var(--primary))] text-white'
                    : 'bg-white/5 hover:bg-white/10'
                } ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {size}×{size}
              </button>
            ))}
          </div>
        </GlassCard>
        
        {/* Grid */}
        <GlassCard>
          <div 
            className="grid gap-2"
            style={{ 
              gridTemplateColumns: `repeat(${difficulty}, 1fr)`,
              aspectRatio: '1/1'
            }}
          >
            {grid.map((num, i) => (
              <button
                key={i}
                onClick={() => handleCellClick(num)}
                disabled={!isPlaying}
                className={`aspect-square rounded-xl flex items-center justify-center text-2xl transition-all ${
                  !isPlaying
                    ? 'bg-white/5 text-[rgb(var(--muted-foreground))]'
                    : num < currentNumber
                      ? 'bg-green-500/20 text-green-400'
                      : num === currentNumber
                        ? 'bg-[rgb(var(--primary))] text-white glow-primary scale-105'
                        : 'bg-white/10 hover:bg-white/20 active:scale-95'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </GlassCard>
        
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
            onClick={generateGrid}
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
              <li>• 按顺序点击数字 1 到 {difficulty * difficulty}</li>
              <li>• 越快完成得分越高</li>
              <li>• 可以锻炼注意力和视觉搜索能力</li>
            </ul>
          </GlassCard>
        )}
      </main>
    </div>
  );
}