import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  Settings,
  X,
  Zap,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/tasks', icon: CheckSquare, label: 'Task Board' },
  { to: '/team', icon: Users, label: 'Network' },
];

interface SidebarProps {
  onClose: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="flex h-full flex-col bg-slate-900/90 backdrop-blur-xl border-r border-white/5">
      {/* Brand Logo */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3.5 group cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-primary blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
            <img src="/logo.png" alt="TTM Logo" className="relative h-10 w-10 object-contain transform group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight leading-none">TTM</h1>
            <div className="flex items-center gap-1 mt-1">
              <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Team Task Manager</p>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-xl p-2 text-slate-500 hover:bg-white/5 hover:text-white lg:hidden transition-all"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto custom-scrollbar">
        <div className="px-3 mb-4">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Main Navigation</p>
        </div>
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={cn(
                'group relative flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300',
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-600/20 to-purple-600/10 border border-indigo-500/20 shadow-[0_0_20px_rgba(79,70,229,0.1)]"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="flex items-center gap-3.5 relative z-10">
                <item.icon className={cn('h-5 w-5 transition-transform group-hover:scale-110', isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300')} />
                <span>{item.label}</span>
              </div>
              {isActive && (
                 <ChevronRight className="w-4 h-4 text-indigo-400 relative z-10" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User info & Logout */}
      <div className="p-4 space-y-3">
        <div className="relative group rounded-3xl bg-white/[0.02] border border-white/5 p-4 hover:bg-white/[0.04] transition-all overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 blur-2xl -mr-10 -mt-10" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-xs font-black text-white shadow-lg">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate leading-none mb-1">{user?.name}</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">{user?.role}</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => logout()}
          className="flex w-full items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 transition-all group"
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
