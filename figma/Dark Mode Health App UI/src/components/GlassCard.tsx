import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className = "", hover = false, onClick }: GlassCardProps) {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-[rgb(var(--card))] rounded-[var(--radius-lg)] p-5 
        border border-white/5 shadow-card
        ${hover ? 'hover:shadow-card-hover active:scale-[0.98] cursor-pointer transition-all' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
