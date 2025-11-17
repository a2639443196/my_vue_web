import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Droplet, Activity, BarChart3, MessageCircle, Gamepad2, TrendingUp, Coffee, Moon } from "lucide-react";
import { TopNav } from "../components/TopNav";
import { SideMenu } from "../components/SideMenu";
import { GlassCard } from "../components/GlassCard";
import { QuickAction } from "../components/QuickAction";
import { CircularProgress } from "../components/CircularProgress";

export function Home() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const todayWater = 1600;
  const waterGoal = 2000;
  
  const recentActivities = [
    { id: 1, type: "water", label: "喝水 200ml", time: "10 分钟前", icon: Droplet },
    { id: 2, type: "activity", label: "完成训练游戏", time: "1 小时前", icon: Gamepad2 },
    { id: 3, type: "mood", label: "记录今日心情", time: "2 小时前", icon: Activity },
  ];
  
  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <TopNav 
        title="彦祖的导航站" 
        showMenu 
        showProfile 
        onMenuClick={() => setMenuOpen(true)}
      />
      
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      <main className="px-6 py-6 max-w-md mx-auto space-y-6 safe-bottom">
        {/* Greeting */}
        <div>
          <h3>早上好，彦祖 👋</h3>
          <p className="text-secondary mt-1">
            {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
        </div>
        
        {/* Water Progress */}
        <GlassCard>
          <div className="flex flex-col items-center">
            <p className="mb-4">今日喝水进度</p>
            <CircularProgress 
              value={todayWater} 
              max={waterGoal} 
              label={`${todayWater}ml`}
              subLabel={`目标 ${waterGoal}ml`}
            />
            <div className="flex items-center gap-6 mt-6 w-full">
              <div className="flex-1 text-center">
                <div className="caption mb-1">已完成</div>
                <div className="text-[rgb(var(--accent))]">{Math.round((todayWater / waterGoal) * 100)}%</div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex-1 text-center">
                <div className="caption mb-1">还需</div>
                <div className="text-[rgb(var(--primary))]">{waterGoal - todayWater}ml</div>
              </div>
            </div>
          </div>
        </GlassCard>
        
        {/* Quick Actions */}
        <div>
          <h4 className="mb-4">快捷操作</h4>
          <div className="grid grid-cols-4 gap-3">
            <QuickAction 
              icon={Droplet} 
              label="喝水" 
              onClick={() => navigate("/water")}
              color="rgb(var(--accent))"
            />
            <QuickAction 
              icon={Activity} 
              label="活动" 
              onClick={() => navigate("/activities")}
              color="rgb(var(--primary))"
            />
            <QuickAction 
              icon={Gamepad2} 
              label="游戏" 
              onClick={() => navigate("/games")}
              color="rgb(var(--secondary))"
            />
            <QuickAction 
              icon={MessageCircle} 
              label="聊天" 
              onClick={() => navigate("/chat")}
              color="rgb(139, 92, 246)"
            />
          </div>
        </div>
        
        {/* Activity Timeline */}
        <div>
          <h4 className="mb-4">最近活动</h4>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <GlassCard key={activity.id}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[rgb(var(--primary))]/20 flex items-center justify-center">
                    <activity.icon className="w-5 h-5 text-[rgb(var(--primary))]" />
                  </div>
                  <div className="flex-1">
                    <p>{activity.label}</p>
                    <p className="caption mt-1">{activity.time}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
        
        {/* Feature Cards */}
        <div className="grid grid-cols-2 gap-4">
          <GlassCard hover onClick={() => navigate("/dashboard")}>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <p>数据看板</p>
                <p className="caption mt-1">查看详细统计</p>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard hover onClick={() => navigate("/activities")}>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p>活动中心</p>
                <p className="caption mt-1">记录每日动态</p>
              </div>
            </div>
          </GlassCard>
        </div>
        
        {/* Quick Stats */}
        <GlassCard>
          <h4 className="mb-4">今日概览</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Coffee className="w-5 h-5 text-orange-400" />
                <span>咖啡因摄入</span>
              </div>
              <span>120mg</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gamepad2 className="w-5 h-5 text-purple-400" />
                <span>训练次数</span>
              </div>
              <span>3 次</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-blue-400" />
                <span>睡眠质量</span>
              </div>
              <span>良好</span>
            </div>
          </div>
        </GlassCard>
      </main>
    </div>
  );
}