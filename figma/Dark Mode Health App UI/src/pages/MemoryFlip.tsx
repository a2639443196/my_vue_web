import { useState, useEffect } from "react";
import { TopNav } from "../components/TopNav";
import { GlassCard } from "../components/GlassCard";
import { Button } from "../components/ui/button";
import { Play, RotateCcw } from "lucide-react";

interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export function MemoryFlip() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bestMoves, setBestMoves] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const emojis = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🥝', '🍑'];
  
  useEffect(() => {
    initializeGame();
  }, []);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, startTime]);
  
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      const firstCard = cards.find(c => c.id === first);
      const secondCard = cards.find(c => c.id === second);
      
      if (firstCard?.value === secondCard?.value) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === first || card.id === second
              ? { ...card, isMatched: true }
              : card
          ));
          setMatches(prev => prev + 1);
          setFlippedCards([]);
          
          // Check if game is won
          if (matches + 1 === emojis.length) {
            setIsPlaying(false);
            if (!bestMoves || moves + 1 < bestMoves) {
              setBestMoves(moves + 1);
            }
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(card => 
            card.id === first || card.id === second
              ? { ...card, isFlipped: false }
              : card
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [flippedCards, cards, matches, moves, bestMoves]);
  
  const initializeGame = () => {
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((value, index) => ({
        id: index,
        value,
        isFlipped: false,
        isMatched: false
      }));
    
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setElapsedTime(0);
  };
  
  const handleStart = () => {
    initializeGame();
    setIsPlaying(true);
    setStartTime(Date.now());
  };
  
  const handleCardClick = (id: number) => {
    if (!isPlaying || flippedCards.length >= 2) return;
    
    const card = cards.find(c => c.id === id);
    if (card?.isFlipped || card?.isMatched) return;
    
    setCards(prev => prev.map(c => 
      c.id === id ? { ...c, isFlipped: true } : c
    ));
    
    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);
    
    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
    }
  };
  
  const formatTime = (ms: number) => {
    return (ms / 1000).toFixed(1);
  };
  
  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <TopNav title="记忆翻牌" showBack />
      
      <main className="px-6 py-6 max-w-md mx-auto space-y-6 safe-bottom">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <GlassCard className="text-center">
            <div className="caption mb-1">步数</div>
            <div className="text-xl text-[rgb(var(--primary))]">{moves}</div>
          </GlassCard>
          <GlassCard className="text-center">
            <div className="caption mb-1">配对</div>
            <div className="text-xl text-green-400">{matches}/{emojis.length}</div>
          </GlassCard>
          <GlassCard className="text-center">
            <div className="caption mb-1">用时</div>
            <div className="text-xl text-[rgb(var(--accent))]">{formatTime(elapsedTime)}s</div>
          </GlassCard>
          <GlassCard className="text-center">
            <div className="caption mb-1">最佳</div>
            <div className="text-xl text-yellow-400">{bestMoves || '-'}</div>
          </GlassCard>
        </div>
        
        {/* Game Grid */}
        <GlassCard>
          <div className="grid grid-cols-4 gap-3">
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                disabled={!isPlaying}
                className={`aspect-square rounded-xl flex items-center justify-center text-3xl transition-all transform ${
                  card.isMatched
                    ? 'bg-green-500/20 scale-95'
                    : card.isFlipped
                      ? 'bg-[rgb(var(--primary))] rotate-0 scale-105'
                      : 'bg-gradient-to-br from-[rgb(var(--card-elevated))] to-[rgb(var(--card))] hover:scale-105 active:scale-95'
                } ${!isPlaying ? 'opacity-50' : ''}`}
                style={{
                  transform: card.isFlipped || card.isMatched ? 'rotateY(0deg)' : 'rotateY(180deg)',
                  transformStyle: 'preserve-3d',
                  transition: 'all 0.3s'
                }}
              >
                {(card.isFlipped || card.isMatched) && card.value}
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
            onClick={handleStart}
            variant="outline"
            className="h-14 w-14 border-white/10"
            size="icon"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Progress */}
        {isPlaying && (
          <GlassCard>
            <div className="flex items-center justify-between mb-2">
              <span>游戏进度</span>
              <span className="text-[rgb(var(--accent))]">
                {Math.round((matches / emojis.length) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--primary))] rounded-full transition-all duration-500"
                style={{ width: `${(matches / emojis.length) * 100}%` }}
              />
            </div>
          </GlassCard>
        )}
        
        {/* Instructions */}
        {!isPlaying && (
          <GlassCard>
            <h4 className="mb-3">游戏说明</h4>
            <ul className="space-y-2 text-sm text-secondary">
              <li>• 点击卡片翻开，找到相同的配对</li>
              <li>• 用最少的步数完成所有配对</li>
              <li>• 锻炼短期记忆和注意力</li>
            </ul>
          </GlassCard>
        )}
      </main>
    </div>
  );
}