import { Menu, ArrowLeft, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TopNavProps {
  title: string;
  showBack?: boolean;
  showMenu?: boolean;
  showProfile?: boolean;
  onMenuClick?: () => void;
}

export function TopNav({ 
  title, 
  showBack = false, 
  showMenu = true, 
  showProfile = false,
  onMenuClick 
}: TopNavProps) {
  const navigate = useNavigate();
  
  return (
    <nav className="safe-top sticky top-0 z-50 glass-strong border-b border-white/5 px-4 py-3">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="w-10 h-10 flex items-center justify-center">
          {showBack && (
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 active:scale-95 transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          {showMenu && !showBack && (
            <button 
              onClick={onMenuClick}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 active:scale-95 transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
        </div>
        
        <h2 className="flex-1 text-center">{title}</h2>
        
        <div className="w-10 h-10 flex items-center justify-center">
          {showProfile && (
            <button 
              onClick={() => navigate('/profile')}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 active:scale-95 transition-all"
            >
              <User className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
