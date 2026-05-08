import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Calendar, Trash2, CheckCircle2, Clock, AlertCircle, ListTodo } from 'lucide-react';
import { useTaskStore } from '@/stores/taskStore';
import LoadingSpinner from '@/components/LoadingSpinner';
import { priorityColors, statusColors, statusLabels, formatDate, isOverdue, getInitials } from '@/lib/utils';
import type { TaskStatus } from '@/types';

const statusIcons: Record<string, any> = {
  'todo': ListTodo, 'in-progress': Clock,
  'in-review': AlertCircle, 'completed': CheckCircle2,
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

  const selectClass = "rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text-primary focus:border-primary focus:outline-none";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">My Tasks</h1>
        <p className="text-text-secondary text-sm mt-1">{filtered.length} task{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tasks..."
            className="w-full rounded-lg border border-border bg-surface-light pl-10 pr-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={selectClass}>
          <option value="all">All Status</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="in-review">In Review</option>
          <option value="completed">Completed</option>
        </select>
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className={selectClass}>
          <option value="all">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filtered.map((task, i) => (
          <motion.div key={task._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
            className="group flex items-center gap-4 rounded-xl border border-border bg-surface-light p-4 hover:border-primary/30 transition-all">
            {/* Status indicator */}
            <button onClick={() => updateTask(task._id, { status: task.status === 'completed' ? 'todo' : 'completed' })}
              className={`h-5 w-5 rounded-full border-2 shrink-0 transition-colors ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500' : 'border-text-muted hover:border-primary'}`}>
              {task.status === 'completed' && <svg className="h-full w-full text-white p-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-medium ${task.status === 'completed' ? 'text-text-muted line-through' : 'text-text-primary'}`}>{task.title}</h3>
              {task.description && <p className="text-xs text-text-muted mt-0.5 truncate">{task.description}</p>}
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 shrink-0">
              <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${priorityColors[task.priority]}`}>{task.priority}</span>
              <span className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium ${statusColors[task.status]}`}>
                {(() => {
                  const Icon = statusIcons[task.status];
                  return <Icon className="h-2.5 w-2.5" />;
                })()}
                {statusLabels[task.status]}
              </span>
              {task.dueDate && (
                <span className={`flex items-center gap-1 text-xs ${isOverdue(task.dueDate) && task.status !== 'completed' ? 'text-red-400' : 'text-text-muted'}`}>
                  <Calendar className="h-3 w-3" /> {formatDate(task.dueDate)}
                </span>
              )}
              {task.assignee && (
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[9px] font-bold text-white" title={task.assignee.name}>
                  {getInitials(task.assignee.name)}
                </div>
              )}
              <button onClick={() => deleteTask(task._id)}
                className="rounded p-1 text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-text-muted">No tasks found</p>
          </div>
        )}
      </div>
    </div>
  );
}
