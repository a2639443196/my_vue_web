import { LucideIcon } from "lucide-react";

interface QuickActionProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  color?: string;
}

export function QuickAction({ icon: Icon, label, onClick, color = "rgb(var(--primary))" }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[rgb(var(--card))] border border-white/5 hover:bg-[rgb(var(--card-elevated))] active:scale-95 transition-all"
    >
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
      <span className="caption">{label}</span>
    </button>
  );
}
