import { useState } from "react";
import { TopNav } from "../components/TopNav";
import { GlassCard } from "../components/GlassCard";
import { Camera, Edit, Download, Settings, Bell, Shield, HelpCircle, LogOut } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "彦祖",
    email: "yanzu@example.com",
    bio: "热爱健康生活，追求高效工作",
    joinDate: "2024年1月"
  });
  
  const stats = [
    { label: "连续打卡", value: "15天", color: "text-green-400" },
    { label: "总活动", value: "234次", color: "text-blue-400" },
    { label: "喝水量", value: "156L", color: "text-cyan-400" },
    { label: "游戏次数", value: "120次", color: "text-purple-400" },
  ];
  
  const settings = [
    { icon: Bell, label: "通知设置", action: () => {} },
    { icon: Shield, label: "隐私与安全", action: () => {} },
    { icon: Download, label: "导出数据", action: () => {} },
    { icon: HelpCircle, label: "帮助与反馈", action: () => {} },
  ];
  
  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <TopNav title="个人中心" showBack />
      
      <main className="px-6 py-6 max-w-md mx-auto space-y-6 safe-bottom">
        {/* Profile Header */}
        <GlassCard>
          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--secondary))] flex items-center justify-center text-4xl">
                🧑
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[rgb(var(--primary))] flex items-center justify-center border-2 border-[rgb(var(--background))] hover:scale-110 transition-transform">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            {!isEditing ? (
              <>
                <h3 className="mb-1">{profile.name}</h3>
                <p className="text-secondary mb-2">{profile.email}</p>
                <p className="caption mb-4">{profile.bio}</p>
                <Button 
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="border-white/10"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  编辑资料
                </Button>
              </>
            ) : (
              <div className="w-full space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">用户名</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="bg-[rgb(var(--surface))] border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">个人简介</Label>
                  <Input
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="bg-[rgb(var(--surface))] border-white/10"
                  />
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => setIsEditing(false)}
                    className="flex-1 gradient-primary"
                  >
                    保存
                  </Button>
                  <Button 
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="flex-1 border-white/10"
                  >
                    取消
                  </Button>
                </div>
              </div>
            )}
          </div>
        </GlassCard>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat, i) => (
            <GlassCard key={i} className="text-center">
              <div className={`text-2xl mb-1 ${stat.color}`}>{stat.value}</div>
              <div className="caption">{stat.label}</div>
            </GlassCard>
          ))}
        </div>
        
        {/* Achievement */}
        <GlassCard>
          <h4 className="mb-4">最近成就</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
              <div className="flex-1">
                <p>连续打卡 7 天</p>
                <p className="caption">获得于 2天前</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <span className="text-2xl">💧</span>
              </div>
              <div className="flex-1">
                <p>喝水达人</p>
                <p className="caption">累计喝水 100L</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <span className="text-2xl">🎮</span>
              </div>
              <div className="flex-1">
                <p>游戏高手</p>
                <p className="caption">完成 100 次训练</p>
              </div>
            </div>
          </div>
        </GlassCard>
        
        {/* Settings */}
        <div>
          <h4 className="mb-4">设置</h4>
          <GlassCard className="p-0">
            {settings.map((setting, i) => (
              <button
                key={i}
                onClick={setting.action}
                className={`w-full flex items-center gap-4 p-4 hover:bg-white/5 transition-all ${
                  i !== settings.length - 1 ? 'border-b border-white/5' : ''
                }`}
              >
                <setting.icon className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
                <span className="flex-1 text-left">{setting.label}</span>
                <span className="text-[rgb(var(--muted-foreground))]">›</span>
              </button>
            ))}
          </GlassCard>
        </div>
        
        {/* Account Info */}
        <GlassCard>
          <h4 className="mb-4">账号信息</h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[rgb(var(--muted-foreground))]">加入时间</span>
              <span>{profile.joinDate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[rgb(var(--muted-foreground))]">账号ID</span>
              <span>YZ-2024-0001</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[rgb(var(--muted-foreground))]">版本</span>
              <span>v1.0.0</span>
            </div>
          </div>
        </GlassCard>
        
        {/* Logout */}
        <Button 
          variant="outline" 
          className="w-full h-12 border-red-500/30 text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="w-5 h-5 mr-2" />
          退出登录
        </Button>
      </main>
    </div>
  );
}