import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Calendar, Trash2, CheckCircle2, Clock, AlertCircle, ListTodo, ChevronRight } from 'lucide-react';
import { useTaskStore } from '@/stores/taskStore';
import LoadingSpinner from '@/components/LoadingSpinner';
import { priorityColors, statusLabels, formatDate, isOverdue, getInitials } from '@/lib/utils';
import type { TaskStatus } from '@/types';

const statusIcons: Record<string, any> = {
  'todo': ListTodo, 
  'in-progress': Clock,
  'in-review': AlertCircle, 
  'completed': CheckCircle2,
};

const iconColors: Record<string, string> = {
  'todo': 'text-slate-400', 
  'in-progress': 'text-blue-400',
  'in-review': 'text-purple-400', 
  'completed': 'text-emerald-400',
};

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

export default function TasksPage() {
  const { tasks, fetchTasks, updateTask, deleteTask, isLoading } = useTaskStore();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  useEffect(() => { fetchTasks(); }, []);

  const filtered = tasks.filter((t) => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (isLoading && tasks.length === 0) return <LoadingSpinner />;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 pb-20"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Task Board</h1>
          <p className="text-slate-400 font-medium">Manage your personal workspace tasks</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Search tasks..."
              className="pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-full md:w-64 transition-all" 
            />
          </div>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 appearance-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="in-review">In Review</option>
            <option value="completed">Completed</option>
          </select>
          <select 
            value={filterPriority} 
            onChange={(e) => setFilterPriority(e.target.value)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 appearance-none cursor-pointer"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((task, i) => {
            const Icon = statusIcons[task.status];
            return (
              <motion.div 
                key={task._id} 
                layout
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.02 }}
                className="group relative flex items-center gap-4 rounded-3xl border border-white/5 bg-white/[0.02] p-5 hover:border-white/10 hover:bg-white/[0.04] transition-all"
              >
                <button 
                  onClick={() => updateTask(task._id, { status: task.status === 'completed' ? 'todo' : 'completed' })}
                  className={`h-6 w-6 rounded-xl border-2 shrink-0 transition-all flex items-center justify-center ${task.status === 'completed' ? 'bg-indigo-500 border-indigo-500' : 'border-slate-700 hover:border-indigo-500'}`}
                >
                  {task.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-white" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className={`text-base font-bold truncate ${task.status === 'completed' ? 'text-slate-600 line-through' : 'text-white group-hover:text-indigo-300'} transition-colors`}>
                      {task.title}
                    </h3>
                    <div className={`px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-widest ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </div>
                  </div>
                  {task.description && <p className="text-xs text-slate-500 font-medium truncate">{task.description}</p>}
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className={`hidden sm:flex items-center gap-2 rounded-xl px-3 py-1.5 bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest ${iconColors[task.status]}`}>
                    <Icon className="h-3.5 w-3.5" />
                    {statusLabels[task.status]}
                  </div>
                  
                  {task.dueDate && (
                    <div className={`flex items-center gap-1.5 text-[11px] font-bold ${isOverdue(task.dueDate) && task.status !== 'completed' ? 'text-rose-400' : 'text-slate-500'}`}>
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(task.dueDate)}
                    </div>
                  )}

                  <div className="flex -space-x-2">
                    {task.assignee && (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-black text-white ring-2 ring-slate-900 shadow-lg" title={task.assignee.name}>
                        {getInitials(task.assignee.name)}
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => deleteTask(task._id)}
                    className="rounded-xl p-2 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {filtered.length === 0 && (
          <div className="text-center py-24 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
            <ListTodo className="h-12 w-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-bold italic">No tasks found matching your filters</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
