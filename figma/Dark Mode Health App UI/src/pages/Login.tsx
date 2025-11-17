import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Chrome, Github } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("请填写所有字段");
      return;
    }
    // Mock login
    navigate("/");
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[rgb(var(--background))] to-[rgb(var(--card))]">
      <div className="flex-1 flex flex-col justify-center px-6 py-12 max-w-md mx-auto w-full">
        {/* Logo & Title */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl gradient-primary flex items-center justify-center glow-primary">
            <span className="text-3xl">🧭</span>
          </div>
          <h1 className="mb-2">彦祖的导航站</h1>
          <p className="text-secondary">健康管理 · 高效生活</p>
        </div>
        
        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-12 bg-[rgb(var(--card))] border-white/10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 h-12 bg-[rgb(var(--card))] border-white/10"
              />
            </div>
          </div>
          
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full h-12 gradient-primary glow-primary"
          >
            登录
          </Button>
        </form>
        
        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-white/10" />
          <span className="caption">或使用第三方登录</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>
        
        {/* Social Login */}
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-12 border-white/10">
            <Chrome className="w-5 h-5 mr-2" />
            Google
          </Button>
          <Button variant="outline" className="h-12 border-white/10">
            <Github className="w-5 h-5 mr-2" />
            GitHub
          </Button>
        </div>
        
        {/* Register Link */}
        <div className="text-center mt-8">
          <button 
            onClick={() => navigate("/register")}
            className="text-[rgb(var(--primary))] hover:underline"
          >
            还没有账号？立即注册
          </button>
        </div>
      </div>
    </div>
  );
}