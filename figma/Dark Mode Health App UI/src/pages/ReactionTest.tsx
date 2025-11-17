import { useState, useEffect, useRef } from "react";
import { TopNav } from "../components/TopNav";
import { GlassCard } from "../components/GlassCard";
import { Button } from "../components/ui/button";
import { Zap, RotateCcw } from "lucide-react";

type GameState = 'waiting' | 'ready' | 'go' | 'result' | 'tooEarly';

export function ReactionTest() {
  const [state, setState] = useState<GameState>('waiting');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);
  
  const handleStart = () => {
    setState('ready');
    const delay = 2000 + Math.random() * 3000; // 2-5 seconds
    
    timerRef.current = setTimeout(() => {
      setState('go');
      startTimeRef.current = Date.now();
    }, delay);
  };
  
  const handleClick = () => {
    if (state === 'ready') {
      setState('tooEarly');
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    
    if (state === 'go') {
      const time = Date.now() - startTimeRef.current;
      setReactionTime(time);
      setAttempts(prev => [...prev, time].slice(-5));
      
      if (!bestTime || time < bestTime) {
        setBestTime(time);
      }
      
      setState('result');
    }
  };
  
  const handleReset = () => {
    setState('waiting');
    setReactionTime(null);
  };
  
  const getAverageTime = () => {
    if (attempts.length === 0) return null;
    return Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length);
  };
  
  const getRating = (time: number) => {
    if (time < 200) return { label: '极快', color: 'text-green-400' };
    if (time < 250) return { label: '很快', color: 'text-blue-400' };
    if (time < 300) return { label: '快速', color: 'text-cyan-400' };
    if (time < 350) return { label: '一般', color: 'text-yellow-400' };
    return { label: '需要练习', color: 'text-orange-400' };
  };
  
  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <TopNav title="反应速度测试" showBack />
      
      <main className="px-6 py-6 max-w-md mx-auto space-y-6 safe-bottom">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <GlassCard className="text-center">
            <div className="caption mb-1">本次</div>
            <div className="text-2xl text-[rgb(var(--accent))]">
              {reactionTime ? `${reactionTime}ms` : '-'}
            </div>
          </GlassCard>
          <GlassCard className="text-center">
            <div className="caption mb-1">最佳</div>
            <div className="text-2xl text-green-400">
              {bestTime ? `${bestTime}ms` : '-'}
            </div>
          </GlassCard>
          <GlassCard className="text-center">
            <div className="caption mb-1">平均</div>
            <div className="text-2xl text-[rgb(var(--primary))]">
              {getAverageTime() ? `${getAverageTime()}ms` : '-'}
            </div>
          </GlassCard>
        </div>
        
        {/* Game Area */}
        <GlassCard className="min-h-[400px]">
          <div 
            className={`h-[400px] rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
              state === 'waiting' ? 'bg-[rgb(var(--primary))]/10 border-2 border-[rgb(var(--primary))]/30' :
              state === 'ready' ? 'bg-red-500/10 border-2 border-red-500/30' :
              state === 'go' ? 'bg-green-500/20 border-2 border-green-500 glow-primary' :
              state === 'tooEarly' ? 'bg-red-500/20 border-2 border-red-500' :
              'bg-[rgb(var(--card))]'
            }`}
            onClick={state === 'waiting' ? handleStart : state === 'ready' || state === 'go' ? handleClick : undefined}
          >
            {state === 'waiting' && (
              <div className="text-center">
                <Zap className="w-16 h-16 mx-auto mb-4 text-[rgb(var(--primary))]" />
                <h3 className="mb-2">准备开始</h3>
                <p className="text-[rgb(var(--muted-foreground))]">点击区域开始测试</p>
              </div>
            )}
            
            {state === 'ready' && (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500 animate-pulse" />
                <h3 className="text-red-400">等待...</h3>
                <p className="text-[rgb(var(--muted-foreground))] mt-2">准备点击</p>
              </div>
            )}
            
            {state === 'go' && (
              <div className="text-center animate-pulse">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-green-500 glow-primary" />
                <h2 className="text-green-400">点击!</h2>
              </div>
            )}
            
            {state === 'tooEarly' && (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500" />
                <h3 className="text-red-400 mb-2">太早了!</h3>
                <p className="text-[rgb(var(--muted-foreground))] mb-6">等绿色出现后再点击</p>
                <Button onClick={handleReset} variant="outline" className="border-white/10">
                  重新开始
                </Button>
              </div>
            )}
            
            {state === 'result' && reactionTime && (
              <div className="text-center">
                <Zap className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                <div className="text-5xl mb-2">{reactionTime}ms</div>
                <div className={`text-xl mb-6 ${getRating(reactionTime).color}`}>
                  {getRating(reactionTime).label}
                </div>
                <Button onClick={handleReset} className="gradient-primary">
                  <RotateCcw className="w-5 h-5 mr-2" />
                  再测一次
                </Button>
              </div>
            )}
          </div>
        </GlassCard>
        
        {/* Recent Attempts */}
        {attempts.length > 0 && (
          <GlassCard>
            <h4 className="mb-4">最近记录</h4>
            <div className="space-y-2">
              {attempts.slice().reverse().map((time, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="caption">第 {attempts.length - i} 次</span>
                  <span className={getRating(time).color}>{time}ms</span>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
        
        {/* Instructions */}
        <GlassCard>
          <h4 className="mb-3">测试说明</h4>
          <ul className="space-y-2 text-sm text-secondary">
            <li>• 点击开始后等待绿色信号</li>
            <li>• 看到绿色后立即点击</li>
            <li>• 多次测试获得更准确的平均值</li>
            <li>• 正常反应时间在 200-300ms 之间</li>
          </ul>
        </GlassCard>
      </main>
    </div>
  );
}