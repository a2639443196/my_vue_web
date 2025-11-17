import { Home, BarChart3, Activity, Droplet, MessageCircle, Gamepad2, User, LogOut, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const navigate = useNavigate();
  
  const menuItems = [
    { icon: Home, label: "首页", path: "/" },
    { icon: BarChart3, label: "数据看板", path: "/dashboard" },
    { icon: Activity, label: "活动中心", path: "/activities" },
    { icon: Droplet, label: "喝水打卡", path: "/water" },
    { icon: MessageCircle, label: "聊天室", path: "/chat" },
    { icon: Gamepad2, label: "训练游戏", path: "/games" },
    { icon: User, label: "个人中心", path: "/profile" },
  ];
  
  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Menu Drawer */}
      <div 
        className={`fixed top-0 left-0 bottom-0 w-72 bg-[rgb(var(--card))] border-r border-white/10 z-50 transition-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="safe-top p-6">
          <div className="flex items-center justify-between mb-8">
            <h3>彦祖的导航站</h3>
            <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 active:scale-95 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigate(item.path)}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 active:scale-95 transition-all text-left"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          
          <div className="absolute bottom-8 left-6 right-6">
            <button className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 active:scale-95 transition-all text-red-400">
              <LogOut className="w-5 h-5" />
              <span>退出登录</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
