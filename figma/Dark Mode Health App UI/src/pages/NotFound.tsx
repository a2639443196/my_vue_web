import { useNavigate } from "react-router-dom";
import { Home, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";

export function NotFound() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-[rgb(var(--background))] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto rounded-full bg-[rgb(var(--primary))]/10 flex items-center justify-center">
            <AlertCircle className="w-16 h-16 text-[rgb(var(--primary))]" />
          </div>
        </div>
        
        {/* Error Code */}
        <div className="mb-6">
          <div className="text-6xl mb-4 bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--secondary))] bg-clip-text text-transparent">
            404
          </div>
          <h2 className="mb-2">页面未找到</h2>
          <p className="text-secondary">
            抱歉，您访问的页面不存在或已被移除
          </p>
        </div>
        
        {/* Actions */}
        <div className="space-y-3">
          <Button 
            onClick={() => navigate("/")}
            className="w-full h-12 gradient-primary glow-primary"
          >
            <Home className="w-5 h-5 mr-2" />
            返回首页
          </Button>
          
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
            className="w-full h-12 border-white/10"
          >
            返回上一页
          </Button>
        </div>
        
        {/* Suggestions */}
        <div className="mt-12 p-6 rounded-2xl bg-[rgb(var(--card))] border border-white/5">
          <h4 className="mb-3">您可能想要访问</h4>
          <div className="space-y-2">
            {[
              { label: '首页', path: '/' },
              { label: '数据看板', path: '/dashboard' },
              { label: '喝水打卡', path: '/water' },
              { label: '训练游戏', path: '/games' },
            ].map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="w-full text-left py-2 px-3 rounded-lg hover:bg-white/5 transition-all text-[rgb(var(--primary))]"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}