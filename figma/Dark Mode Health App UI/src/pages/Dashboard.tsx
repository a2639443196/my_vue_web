import { useState } from "react";
import { TopNav } from "../components/TopNav";
import { GlassCard } from "../components/GlassCard";
import { TrendingUp, TrendingDown, Activity, Droplet, Coffee, Zap } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";

export function Dashboard() {
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  
  const waterData = [
    { day: '周一', amount: 1800 },
    { day: '周二', amount: 2100 },
    { day: '周三', amount: 1600 },
    { day: '周四', amount: 2200 },
    { day: '周五', amount: 1900 },
    { day: '周六', amount: 2400 },
    { day: '周日', amount: 2000 },
  ];
  
  const activityData = [
    { day: '周一', count: 3 },
    { day: '周二', count: 5 },
    { day: '周三', count: 2 },
    { day: '周四', count: 4 },
    { day: '周五', count: 6 },
    { day: '周六', count: 4 },
    { day: '周日', count: 3 },
  ];
  
  const stats = [
    { 
      label: "日均喝水", 
      value: "2.0L", 
      change: "+12%", 
      trend: "up",
      icon: Droplet,
      color: "text-cyan-400"
    },
    { 
      label: "活动次数", 
      value: "27", 
      change: "+8%", 
      trend: "up",
      icon: Activity,
      color: "text-green-400"
    },
    { 
      label: "咖啡因", 
      value: "98mg", 
      change: "-15%", 
      trend: "down",
      icon: Coffee,
      color: "text-orange-400"
    },
    { 
      label: "训练分数", 
      value: "856", 
      change: "+24%", 
      trend: "up",
      icon: Zap,
      color: "text-purple-400"
    },
  ];
  
  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <TopNav title="数据看板" showBack showProfile />
      
      <main className="px-6 py-6 max-w-md mx-auto space-y-6 safe-bottom">
        {/* Time Range Selector */}
        <div className="flex gap-2 p-1 bg-[rgb(var(--card))] rounded-xl">
          <button
            onClick={() => setTimeRange('week')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              timeRange === 'week' 
                ? 'bg-[rgb(var(--primary))] text-white' 
                : 'text-[rgb(var(--muted-foreground))]'
            }`}
          >
            本周
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`flex-1 py-2 rounded-lg transition-all ${
              timeRange === 'month' 
                ? 'bg-[rgb(var(--primary))] text-white' 
                : 'text-[rgb(var(--muted-foreground))]'
            }`}
          >
            本月
          </button>
        </div>
        
        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, i) => (
            <GlassCard key={i}>
              <div className="flex items-start justify-between mb-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <div className={`flex items-center gap-1 text-sm ${
                  stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
              <div className="text-2xl mb-1">{stat.value}</div>
              <div className="caption">{stat.label}</div>
            </GlassCard>
          ))}
        </div>
        
        {/* Water Intake Chart */}
        <GlassCard>
          <h4 className="mb-4">喝水趋势</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={waterData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="day" 
                stroke="rgb(var(--text-tertiary))" 
                fontSize={12}
              />
              <YAxis 
                stroke="rgb(var(--text-tertiary))" 
                fontSize={12}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="rgb(var(--accent))" 
                strokeWidth={3}
                dot={{ fill: 'rgb(var(--accent))', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-between mt-4">
            <div>
              <div className="caption">平均值</div>
              <div className="text-[rgb(var(--accent))]">2003ml</div>
            </div>
            <div>
              <div className="caption">最高值</div>
              <div className="text-[rgb(var(--accent))]">2400ml</div>
            </div>
            <div>
              <div className="caption">最低值</div>
              <div className="text-[rgb(var(--accent))]">1600ml</div>
            </div>
          </div>
        </GlassCard>
        
        {/* Activity Chart */}
        <GlassCard>
          <h4 className="mb-4">活动统计</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="day" 
                stroke="rgb(var(--muted-foreground))" 
                fontSize={12}
              />
              <YAxis 
                stroke="rgb(var(--muted-foreground))" 
                fontSize={12}
              />
              <Bar 
                dataKey="count" 
                fill="url(#barGradient)" 
                radius={[8, 8, 0, 0]}
              />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(var(--primary))" />
                  <stop offset="100%" stopColor="rgb(var(--secondary))" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
        
        {/* Comparison */}
        <GlassCard>
          <h4 className="mb-4">本周对比</h4>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span>喝水完成率</span>
                <span className="text-[rgb(var(--accent))]">92%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--primary))] rounded-full" style={{ width: '92%' }} />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span>活动完成率</span>
                <span className="text-[rgb(var(--primary))]">78%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--secondary))] rounded-full" style={{ width: '78%' }} />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span>游戏训练</span>
                <span className="text-[rgb(var(--secondary))]">85%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[rgb(var(--secondary))] to-purple-500 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>
          </div>
        </GlassCard>
      </main>
    </div>
  );
}