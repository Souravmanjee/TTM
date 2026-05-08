import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BarChart3, CheckCircle2, Clock, AlertTriangle, TrendingUp, FolderKanban, ArrowUpRight, Plus } from 'lucide-react';
import { useTaskStore } from '@/stores/taskStore';
import { useProjectStore } from '@/stores/projectStore';
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from '@/components/LoadingSpinner';
import { statusLabels, getInitials } from '@/lib/utils';

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariants: any = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring', stiffness: 100, damping: 15 } 
  },
};

export default function DashboardPage() {
  const { stats, fetchStats, isLoading: tasksLoading } = useTaskStore();
  const { projects, fetchProjects, isLoading: projLoading } = useProjectStore();
  const user = useAuthStore((s) => s.user);

  useEffect(() => { 
    fetchStats(); 
    fetchProjects(); 
  }, []);

  if (tasksLoading && !stats) return <LoadingSpinner />;

  const getStatCount = (arr: { _id: string; count: number }[] | undefined, id: string) =>
    arr?.find((s) => s._id === id)?.count || 0;

  const totalTasks = stats?.total || 0;
  const completed = getStatCount(stats?.statusStats, 'completed');
  const inProgress = getStatCount(stats?.statusStats, 'in-progress');
  const overdue = stats?.overdue || 0;

  const statCards = [
    { label: 'Total Tasks', value: totalTasks, icon: BarChart3, color: 'text-indigo-400', glow: 'bg-indigo-400/20', border: 'border-indigo-500/20' },
    { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-emerald-400', glow: 'bg-emerald-400/20', border: 'border-emerald-500/20' },
    { label: 'In Progress', value: inProgress, icon: Clock, color: 'text-amber-400', glow: 'bg-amber-400/20', border: 'border-amber-500/20' },
    { label: 'Overdue', value: overdue, icon: AlertTriangle, color: 'text-rose-400', glow: 'bg-rose-400/20', border: 'border-rose-500/20' },
  ];

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-10 relative pb-20"
    >
      {/* Dynamic Background Elements */}
      <div className="absolute -top-40 -right-40 w-full h-[600px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Hero Header */}
      <motion.div variants={cardVariants} className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-3">
            Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-400 text-lg font-medium">
            You have <span className="text-indigo-400 font-bold">{inProgress} tasks</span> in progress today.
          </p>
        </div>
        
        <Link to="/tasks" className="btn-primary flex items-center gap-2 group w-fit">
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
          <span>New Task</span>
        </Link>
      </motion.div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {statCards.map((card, i) => (
          <motion.div 
            key={card.label} 
            variants={cardVariants}
            whileHover={{ y: -5, scale: 1.02 }}
            className={`group relative overflow-hidden rounded-3xl border ${card.border} glass-card p-6 transition-all duration-300 shadow-premium hover:shadow-premium-hover`}
          >
            <div className={`absolute -top-12 -right-12 w-32 h-32 ${card.glow} blur-3xl transition-opacity group-hover:opacity-100 opacity-30`} />
            
            <div className="flex items-start justify-between mb-8">
              <div className={`rounded-2xl p-3 bg-white/5 ${card.color} backdrop-blur-md`}>
                <card.icon className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                <TrendingUp className="h-3 w-3" />
                <span>+12%</span>
              </div>
            </div>
            
            <div>
              <p className="text-4xl font-black text-white mb-1 tabular-nums">{card.value}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">{card.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        {/* Modern Projects List */}
        <motion.div variants={cardVariants} className="lg:col-span-7 rounded-[2.5rem] border border-white/5 glass-panel p-8 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-3xl -mr-32 -mt-32" />
          
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-indigo-500/20 p-3 text-indigo-400 shadow-inner">
                <FolderKanban className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Active Projects</h3>
                <p className="text-xs text-slate-500 font-medium">Tracking {projects.length} workspace projects</p>
              </div>
            </div>
            <Link 
              to="/projects" 
              className="group flex items-center gap-1.5 text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20"
            >
              View All 
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {projects.slice(0, 4).map((p) => (
              <Link 
                key={p._id} 
                to={`/projects/${p._id}`}
                className="group flex items-center justify-between rounded-2xl bg-white/[0.03] p-5 border border-transparent hover:border-white/10 hover:bg-white/[0.06] transition-all"
              >
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 rounded-2xl flex items-center justify-center font-bold text-white shadow-xl relative overflow-hidden group-hover:scale-105 transition-transform" style={{ backgroundColor: p.color }}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                    <span className="relative z-10 text-lg uppercase">{getInitials(p.name)}</span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">{p.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {p.taskCounts?.completed || 0} / {p.taskCounts?.total || 0} Tasks
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="hidden sm:flex flex-col items-end">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.round(((p.taskCounts?.completed || 0) / (p.taskCounts?.total || 1)) * 100) || 0}%` }}
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                        />
                      </div>
                      <span className="text-xs font-black text-indigo-400 w-8 text-right">
                        {Math.round(((p.taskCounts?.completed || 0) / (p.taskCounts?.total || 1)) * 100) || 0}%
                      </span>
                    </div>
                  </div>
                  <div className="h-10 w-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-lg">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            ))}
            
            {projects.length === 0 && (
              <div className="text-center py-16 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/5 mb-4 text-slate-600 animate-pulse">
                  <FolderKanban className="h-10 w-10" />
                </div>
                <h4 className="text-white font-bold mb-1">No active projects</h4>
                <p className="text-sm text-slate-500">Start by creating your first project.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Analytics Breakdown */}
        <motion.div variants={cardVariants} className="lg:col-span-5 rounded-[2.5rem] border border-white/5 glass-panel p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 blur-3xl -ml-32 -mb-32" />
          
          <div className="flex items-center gap-4 mb-10">
            <div className="rounded-2xl bg-purple-500/20 p-3 text-purple-400 shadow-inner">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Efficiency Insights</h3>
              <p className="text-xs text-slate-500 font-medium">Task distribution across statuses</p>
            </div>
          </div>
          
          <div className="space-y-8">
            {['todo', 'in-progress', 'in-review', 'completed'].map((status) => {
              const count = getStatCount(stats?.statusStats, status);
              const pct = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
              const colors: Record<string, string> = { 
                todo: 'from-slate-500 to-slate-400 shadow-slate-500/40', 
                'in-progress': 'from-blue-600 to-indigo-500 shadow-blue-500/40', 
                'in-review': 'from-purple-600 to-fuchsia-500 shadow-purple-500/40', 
                completed: 'from-emerald-600 to-teal-500 shadow-emerald-500/40' 
              };
              return (
                <div key={status} className="group">
                  <div className="flex justify-between items-end mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${colors[status]}`} />
                      <span className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">{statusLabels[status]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{count} tasks</span>
                       <span className="text-sm font-black text-white tabular-nums">{Math.round(pct)}%</span>
                    </div>
                  </div>
                  <div className="h-3.5 rounded-full bg-white/[0.03] overflow-hidden p-[2px] border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${pct}%` }} 
                      transition={{ duration: 1.5, ease: "circOut" }}
                      className={`h-full rounded-full bg-gradient-to-r ${colors[status]} shadow-lg`} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-12 p-6 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-12 h-12 text-indigo-400" />
            </div>
            <h5 className="text-indigo-400 font-black uppercase text-[10px] tracking-widest mb-1">Productivity Tip</h5>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              You've completed <span className="text-white font-bold">{completed} tasks</span> this week. Keep up the momentum!
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
