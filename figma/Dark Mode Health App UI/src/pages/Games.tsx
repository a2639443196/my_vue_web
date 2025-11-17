import { useNavigate } from "react-router-dom";
import { TopNav } from "../components/TopNav";
import { GlassCard } from "../components/GlassCard";
import { Grid3x3, Zap, Brain, Table, Trophy, Clock } from "lucide-react";

export function Games() {
  const navigate = useNavigate();
  
  const games = [
    {
      id: 'schulte',
      name: '舒尔特方格',
      description: '提升注意力和视觉搜索能力',
      icon: Grid3x3,
      color: 'from-blue-500 to-cyan-500',
      bestScore: '12.5秒',
      plays: 45
    },
    {
      id: 'reaction',
      name: '反应速度测试',
      description: '测试你的反应时间',
      icon: Zap,
      color: 'from-yellow-500 to-orange-500',
      bestScore: '245ms',
      plays: 32
    },
    {
      id: 'memory',
      name: '记忆翻牌',
      description: '锻炼短期记忆能力',
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      bestScore: '8步',
      plays: 28
    },
    {
      id: 'sudoku',
      name: '数独挑战',
      description: '逻辑思维训练',
      icon: Table,
      color: 'from-green-500 to-teal-500',
      bestScore: '简单',
      plays: 15
    },
  ];
  
  const leaderboard = [
    { rank: 1, name: '小明', score: 2456, avatar: '👨' },
    { rank: 2, name: '彦祖', score: 2234, avatar: '🧑' },
    { rank: 3, name: '小红', score: 2108, avatar: '👩' },
  ];
  
  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <TopNav title="训练游戏" showBack showProfile />
      
      <main className="px-6 py-6 max-w-md mx-auto space-y-6 safe-bottom">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <GlassCard className="text-center">
            <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
            <div className="text-2xl mb-1">120</div>
            <div className="caption">总次数</div>
          </GlassCard>
          <GlassCard className="text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-blue-400" />
            <div className="text-2xl mb-1">2.5h</div>
            <div className="caption">总时长</div>
          </GlassCard>
          <GlassCard className="text-center">
            <Brain className="w-6 h-6 mx-auto mb-2 text-purple-400" />
            <div className="text-2xl mb-1">856</div>
            <div className="caption">总得分</div>
          </GlassCard>
        </div>
        
        {/* Games Grid */}
        <div>
          <h4 className="mb-4">选择游戏</h4>
          <div className="space-y-4">
            {games.map((game) => (
              <GlassCard 
                key={game.id} 
                hover 
                onClick={() => navigate(`/games/${game.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center flex-shrink-0`}>
                    <game.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="mb-1">{game.name}</h4>
                    <p className="caption">{game.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-[rgb(var(--primary))]">
                        最佳: {game.bestScore}
                      </span>
                      <span className="caption">
                        {game.plays} 次
                      </span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
        
        {/* Leaderboard */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4>排行榜</h4>
            <button className="text-sm text-[rgb(var(--primary))] hover:underline">
              查看全部
            </button>
          </div>
          <GlassCard>
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div key={entry.rank} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    entry.rank === 1 ? 'bg-yellow-500 text-white' :
                    entry.rank === 2 ? 'bg-gray-400 text-white' :
                    'bg-orange-600 text-white'
                  }`}>
                    {entry.rank}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[rgb(var(--primary))]/20 flex items-center justify-center">
                    {entry.avatar}
                  </div>
                  <div className="flex-1">
                    <p>{entry.name}</p>
                  </div>
                  <div className="text-[rgb(var(--primary))]">
                    {entry.score}
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}