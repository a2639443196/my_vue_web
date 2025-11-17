import { useState } from "react";
import { TopNav } from "../components/TopNav";
import { GlassCard } from "../components/GlassCard";
import { Plus, Smile, Meh, Frown, Heart, Coffee, Book, Dumbbell } from "lucide-react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";

export function Activities() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [note, setNote] = useState("");
  
  const moods = [
    { id: 'happy', icon: Smile, label: '开心', color: 'text-green-400' },
    { id: 'normal', icon: Meh, label: '平静', color: 'text-blue-400' },
    { id: 'sad', icon: Frown, label: '低落', color: 'text-gray-400' },
  ];
  
  const categories = [
    { id: 'health', icon: Heart, label: '健康', color: 'bg-red-500' },
    { id: 'food', icon: Coffee, label: '饮食', color: 'bg-orange-500' },
    { id: 'study', icon: Book, label: '学习', color: 'bg-blue-500' },
    { id: 'exercise', icon: Dumbbell, label: '运动', color: 'bg-green-500' },
  ];
  
  const activities = [
    {
      id: 1,
      mood: 'happy',
      category: 'exercise',
      note: '完成了30分钟跑步，感觉很棒！',
      time: '2 小时前',
    },
    {
      id: 2,
      mood: 'normal',
      category: 'study',
      note: '学习了React新特性',
      time: '5 小时前',
    },
    {
      id: 3,
      mood: 'happy',
      category: 'food',
      note: '午餐吃了健康沙拉',
      time: '昨天',
    },
  ];
  
  const handleSave = () => {
    setShowAddForm(false);
    setSelectedMood(null);
    setSelectedCategory(null);
    setNote("");
  };
  
  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      <TopNav title="活动中心" showBack showProfile />
      
      <main className="px-6 py-6 max-w-md mx-auto space-y-6 safe-bottom pb-24">
        {/* Add Button */}
        {!showAddForm && (
          <Button 
            onClick={() => setShowAddForm(true)}
            className="w-full h-12 gradient-primary glow-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            记录新活动
          </Button>
        )}
        
        {/* Add Form */}
        {showAddForm && (
          <GlassCard>
            <h4 className="mb-4">记录活动</h4>
            
            {/* Mood Selection */}
            <div className="mb-5">
              <p className="caption mb-3">今天心情如何？</p>
              <div className="grid grid-cols-3 gap-3">
                {moods.map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() => setSelectedMood(mood.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      selectedMood === mood.id
                        ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10'
                        : 'border-white/10 hover:bg-white/5'
                    }`}
                  >
                    <mood.icon className={`w-8 h-8 ${mood.color}`} />
                    <span className="text-sm">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Category Selection */}
            <div className="mb-5">
              <p className="caption mb-3">选择分类</p>
              <div className="grid grid-cols-4 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                      selectedCategory === cat.id
                        ? 'border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/10'
                        : 'border-white/10 hover:bg-white/5'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${cat.color} flex items-center justify-center`}>
                      <cat.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Note */}
            <div className="mb-5">
              <p className="caption mb-3">备注（可选）</p>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="记录一下今天的活动..."
                className="min-h-[100px] bg-[rgb(var(--surface))] border-white/10 resize-none"
              />
            </div>
            
            {/* Actions */}
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowAddForm(false)}
                variant="outline"
                className="flex-1 h-11 border-white/10"
              >
                取消
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!selectedMood || !selectedCategory}
                className="flex-1 h-11 gradient-primary"
              >
                保存
              </Button>
            </div>
          </GlassCard>
        )}
        
        {/* Activity Timeline */}
        <div>
          <h4 className="mb-4">活动记录</h4>
          <div className="relative space-y-4">
            {/* Timeline line */}
            <div className="absolute left-[19px] top-8 bottom-8 w-0.5 bg-white/10" />
            
            {activities.map((activity) => {
              const mood = moods.find(m => m.id === activity.mood);
              const category = categories.find(c => c.id === activity.category);
              
              return (
                <div key={activity.id} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-6 w-10 h-10 rounded-full bg-[rgb(var(--primary))]/20 flex items-center justify-center border-4 border-[rgb(var(--background))]">
                    {mood && <mood.icon className={`w-5 h-5 ${mood.color}`} />}
                  </div>
                  
                  {/* Content */}
                  <div className="ml-14">
                    <GlassCard>
                      <div className="flex items-start justify-between mb-2">
                        {category && (
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg ${category.color} flex items-center justify-center`}>
                              <category.icon className="w-4 h-4 text-white" />
                            </div>
                            <span>{category.label}</span>
                          </div>
                        )}
                        <span className="caption">{activity.time}</span>
                      </div>
                      <p className="text-[rgb(var(--muted-foreground))]">{activity.note}</p>
                    </GlassCard>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}