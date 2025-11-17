import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Check, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  
  const passwordRequirements = [
    { label: "至少 8 个字符", met: formData.password.length >= 8 },
    { label: "包含数字", met: /\d/.test(formData.password) },
    { label: "包含大写字母", met: /[A-Z]/.test(formData.password) },
    { label: "包含小写字母", met: /[a-z]/.test(formData.password) }
  ];
  
  const handleContinue = () => {
    if (step === 1 && formData.username && formData.email) {
      setStep(2);
    } else if (step === 2) {
      navigate("/");
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[rgb(var(--background))] to-[rgb(var(--card))]">
      <div className="flex-1 flex flex-col justify-center px-6 py-12 max-w-md mx-auto w-full">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-[rgb(var(--primary))]' : 'bg-white/10'}`} />
            <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-[rgb(var(--primary))]' : 'bg-white/10'}`} />
          </div>
          <p className="caption text-center">步骤 {step} / 2</p>
        </div>
        
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="mb-2">创建账号</h1>
          <p className="text-secondary">
            {step === 1 ? "输入基本信息" : "设置安全密码"}
          </p>
        </div>
        
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
                <Input
                  id="username"
                  type="text"
                  placeholder="选择一个用户名"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="pl-12 h-12 bg-[rgb(var(--card))] border-white/10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-12 h-12 bg-[rgb(var(--card))] border-white/10"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Step 2: Password */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
                <Input
                  id="password"
                  type="password"
                  placeholder="设置密码"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-12 h-12 bg-[rgb(var(--card))] border-white/10"
                />
              </div>
            </div>
            
            {/* Password Strength */}
            <div className="p-4 rounded-xl bg-[rgb(var(--card))] border border-white/5">
              <p className="caption mb-3">密码强度要求</p>
              <div className="space-y-2">
                {passwordRequirements.map((req, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {req.met ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <X className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                    )}
                    <span className={`text-sm ${req.met ? 'text-green-400' : 'text-[rgb(var(--muted-foreground))]'}`}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认密码</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="再次输入密码"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="pl-12 h-12 bg-[rgb(var(--card))] border-white/10"
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="mt-8 space-y-4">
          <Button 
            onClick={handleContinue}
            disabled={step === 1 ? !formData.username || !formData.email : !formData.password || !formData.confirmPassword}
            className="w-full h-12 gradient-primary glow-primary"
          >
            {step === 1 ? "继续" : "完成注册"}
          </Button>
          
          {step === 2 && (
            <Button 
              onClick={() => setStep(1)}
              variant="outline"
              className="w-full h-12 border-white/10"
            >
              返回
            </Button>
          )}
        </div>
        
        {/* Login Link */}
        <div className="text-center mt-8">
          <button 
            onClick={() => navigate("/login")}
            className="text-[rgb(var(--primary))] hover:underline"
          >
            已有账号？立即登录
          </button>
        </div>
      </div>
    </div>
  );
}