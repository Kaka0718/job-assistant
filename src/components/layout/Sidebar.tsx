import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  Send,
  User,
  Settings,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_NAME, NAV_ITEMS } from "@/lib/constants";

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={20} />,
  Briefcase: <Briefcase size={20} />,
  MessageSquare: <MessageSquare size={20} />,
  Send: <Send size={20} />,
  User: <User size={20} />,
  Settings: <Settings size={20} />,
};

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-56 flex-col border-r border-border bg-surface">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
          J
        </div>
        <span className="text-base font-semibold text-text-primary">{APP_NAME}</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-bg text-primary"
                  : "text-text-secondary hover:bg-surface-hover hover:text-text-primary",
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                )}
                <span className={cn("flex-shrink-0", isActive ? "text-primary" : "text-text-muted")}>
                  {iconMap[item.icon]}
                </span>
                <span>{item.label}</span>
                {isActive && (
                  <ChevronRight size={14} className="ml-auto text-primary" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-5 py-3">
        <p className="text-xs text-text-muted">v0.1.0</p>
      </div>
    </aside>
  );
}