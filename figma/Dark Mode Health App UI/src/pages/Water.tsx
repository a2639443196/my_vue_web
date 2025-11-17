import { useState } from "react";
import { TopNav } from "../components/TopNav";
import { GlassCard } from "../components/GlassCard";
import { CircularProgress } from "../components/CircularProgress";
import { Droplet, Coffee, Plus, Minus, Calendar } from "lucide-react";
import { Button } from "../components/ui/button";

export function Water() {
  const [todayWater, setTodayWater] = useState(1600);
  const [todayCaffeine, setTodayCaffeine] = useState(120);
  const waterGoal = 2000;
  const caffeineLimit = 400;
  
  const quickAmounts = [100, 200, 300, 500];
  
  const weekData = [
    { day: '周一', amount: 1800, caffeine: 100 },
    { day: '周二', amount: 2100, caffeine: 150 },
    { day: '周三', amount: 1600, caffeine: 80 },
    { day: '周四', amount: 2200, caffeine: 200 },
    { day: '周五', amount: 1900, caffeine: 120 },
    { day: '周六', amount: 2400, caffeine: 90 },
    { day: '周日', amount: 2000, caffeine: 120, active: true },
  ];
  
  const todayLogs = [
    { id: 1, amount: 200, type: 'water', time: '08:30' },
    { id: 2, amount: 300, type: 'water', time: '10:15' },
    { id: 3, amount: 150, type: 'coffee', caffeine: 60, time: '11:00' },
    { id: 4, amount: 500, type: 'water', time: '14:20' },
    { id: 5, amount: 200, type: 'coffee', caffeine: 60, time: '15:30' },
    { id: 6, amount: 400, type: 'water', time: '17:45' },
  ];
  
  const addWater = (amount: number) => {
    setTodayWater(prev => Math.min(prev + amount, waterGoal * 2));
  };
  
  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <TopNav title="喝水打卡" showBack showProfile />
      
      <main className="px-6 py-6 max-w-md mx-auto space-y-6 safe-bottom">
        {/* Progress Ring */}
        <GlassCard>
          <div className="flex flex-col items-center">
            <CircularProgress 
              value={todayWater} 
              max={waterGoal}
              size={220}
              label={`${todayWater}ml`}
              subLabel={`目标 ${waterGoal}ml`}
            />
            
            {/* Quick Add Buttons */}
            <div className="grid grid-cols-4 gap-3 w-full mt-6">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => addWater(amount)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-[rgb(var(--primary))]/10 border border-[rgb(var(--primary))]/20 hover:bg-[rgb(var(--primary))]/20 active:scale-95 transition-all"
                >
                  <Plus className="w-5 h-5 text-[rgb(var(--primary))]" />
                  <span className="text-sm">{amount}ml</span>
                </button>
              ))}
            </div>
          </div>
        </GlassCard>
        
        {/* Caffeine Tracker */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Coffee className="w-5 h-5 text-orange-400" />
              <h4>咖啡因摄入</h4>
            </div>
            <span className="caption">{todayCaffeine} / {caffeineLimit}mg</span>
          </div>
          
          <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-3">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
              style={{ width: `${(todayCaffeine / caffeineLimit) * 100}%` }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-[rgb(var(--muted-foreground))]">
              {todayCaffeine < caffeineLimit * 0.5 && '安全范围'}
              {todayCaffeine >= caffeineLimit * 0.5 && todayCaffeine < caffeineLimit * 0.8 && '适度摄入'}
              {todayCaffeine >= caffeineLimit * 0.8 && '接近上限'}
            </span>
            <span className="text-sm text-orange-400">
              剩余 {caffeineLimit - todayCaffeine}mg
            </span>
          </div>
        </GlassCard>
        
        {/* Week Calendar */}
        <GlassCard>
          <div className="flex items-center justify-between mb-4">
            <h4>本周记录</h4>
            <Calendar className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {weekData.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="caption text-xs">{day.day.slice(1)}</span>
                <div 
                  className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center gap-1 ${
                    day.active 
                      ? 'bg-[rgb(var(--primary))] text-white' 
                      : day.amount >= waterGoal
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-white/5 text-[rgb(var(--muted-foreground))]'
                  }`}
                >
                  <Droplet className="w-3 h-3" />
                  <span className="text-xs">{(day.amount / 1000).toFixed(1)}L</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
        
        {/* Today's Log */}
        <div>
          <h4 className="mb-4">今日记录</h4>
          <div className="space-y-3">
            {todayLogs.map((log) => (
              <GlassCard key={log.id}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      log.type === 'water' 
                        ? 'bg-[rgb(var(--accent))]/20 text-[rgb(var(--accent))]'
                        : 'bg-orange-500/20 text-orange-400'
                    }`}>
                      {log.type === 'water' ? <Droplet className="w-5 h-5" /> : <Coffee className="w-5 h-5" />}
                    </div>
                    <div>
                      <p>{log.amount}ml {log.type === 'water' ? '水' : '咖啡'}</p>
                      {log.caffeine && (
                        <p className="caption">咖啡因 {log.caffeine}mg</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="caption">{log.time}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
        
        {/* Custom Add */}
        <GlassCard>
          <h4 className="mb-4">自定义添加</h4>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="icon"
              className="h-12 w-12 border-white/10"
            >
              <Minus className="w-5 h-5" />
            </Button>
            <div className="flex-1 text-center">
              <input 
                type="number" 
                className="w-full bg-transparent text-center text-2xl outline-none"
                defaultValue={250}
              />
              <p className="caption">ml</p>
            </div>
            <Button 
              variant="outline" 
              size="icon"
              className="h-12 w-12 border-white/10"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
          <Button className="w-full h-11 gradient-primary mt-4">
            <Droplet className="w-5 h-5 mr-2" />
            添加记录
          </Button>
        </GlassCard>
      </main>
    </div>
  );
}