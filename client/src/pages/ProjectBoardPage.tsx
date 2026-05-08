import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowLeft, Calendar, User, Trash2, Edit3, UserPlus, Users, X, CheckCircle2, Clock, AlertCircle, ListTodo, MoreHorizontal, ChevronRight } from 'lucide-react';
import { useTaskStore } from '@/stores/taskStore';
import { useProjectStore } from '@/stores/projectStore';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import Modal from '@/components/Modal';
import LoadingSpinner from '@/components/LoadingSpinner';
import { priorityColors, statusLabels, formatDate, isOverdue, getInitials } from '@/lib/utils';
import type { TaskStatus, TaskPriority, User as UserType } from '@/types';

const COLUMNS: TaskStatus[] = ['todo', 'in-progress', 'in-review', 'completed'];

const columnIcons: Record<string, any> = {
  'todo': ListTodo, 
  'in-progress': Clock,
  'in-review': AlertCircle, 
  'completed': CheckCircle2,
};

const columnGlows: Record<string, string> = {
  'todo': 'shadow-slate-500/10 border-slate-500/20', 
  'in-progress': 'shadow-blue-500/10 border-blue-500/20',
  'in-review': 'shadow-purple-500/10 border-purple-500/20', 
  'completed': 'shadow-emerald-500/10 border-emerald-500/20',
};

const iconColors: Record<string, string> = {
  'todo': 'text-slate-400', 
  'in-progress': 'text-blue-400',
  'in-review': 'text-purple-400', 
  'completed': 'text-emerald-400',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function ProjectBoardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { tasks, fetchTasks, createTask, updateTask, deleteTask, isLoading } = useTaskStore();
  const { currentProject, fetchProject, addMember, removeMember } = useProjectStore();
  
  const [showCreate, setShowCreate] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  
  const [createStatus, setCreateStatus] = useState<TaskStatus>('todo');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (id) { 
      fetchTasks({ project: id }); 
      fetchProject(id);
      loadAllUsers();
    }
  }, [id]);

  const loadAllUsers = async () => {
    try {
      const res = await api.get('/users');
      setAllUsers(res.data.data);
    } catch (err) {
      console.error('Failed to load users', err);
    }
  };

  const isProjectAdmin = currentProject?.owner?._id === user?.id || 
    currentProject?.members.some(m => m.user._id === user?.id && m.role === 'admin') ||
    user?.role === 'admin';

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !id) return;
    await createTask({ title, description: desc, status: createStatus, priority, project: id, dueDate: dueDate || null });
    setShowCreate(false); setTitle(''); setDesc(''); setPriority('medium'); setDueDate('');
    fetchTasks({ project: id });
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    await updateTask(taskId, { status: newStatus });
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm('Delete this task?')) {
      await deleteTask(taskId);
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!id) return;
    try {
      await addMember(id, userId, 'member');
      setShowAddMember(false);
    } catch (err) {
      alert('Failed to add member');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!id || !confirm('Remove this member?')) return;
    try {
      await removeMember(id, userId);
    } catch (err) {
      alert('Failed to remove member');
    }
  };

  const openCreate = (status: TaskStatus) => { setCreateStatus(status); setShowCreate(true); };

  if (isLoading && tasks.length === 0) return <LoadingSpinner />;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 relative pb-10"
    >
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-start gap-5">
          <button 
            onClick={() => navigate('/projects')} 
            className="mt-1 rounded-2xl p-3 bg-white/5 text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all border border-white/5"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-white tracking-tight">
                {currentProject?.name || 'Project Board'}
              </h1>
              {currentProject?.color && (
                <div 
                  className="h-3 w-3 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]" 
                  style={{ backgroundColor: currentProject.color }} 
                />
              )}
            </div>
            {currentProject?.description && (
              <p className="text-slate-400 font-medium mt-1 text-sm">{currentProject.description}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 bg-white/[0.02] border border-white/5 rounded-[2rem] px-6 py-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3 overflow-hidden">
              {currentProject?.members.slice(0, 5).map((member) => (
                <div
                  key={member.user._id}
                  className="inline-block h-9 w-9 rounded-full border-2 border-slate-900 bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white cursor-pointer hover:translate-y-[-2px] transition-transform"
                  title={member.user.name}
                >
                  {getInitials(member.user.name)}
                </div>
              ))}
              {(currentProject?.members.length || 0) > 5 && (
                <div className="inline-block h-9 w-9 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400">
                  +{(currentProject?.members.length || 0) - 5}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowMembers(true)}
              className="text-xs font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <Users className="w-3.5 h-3.5" />
              Manage Team
            </button>
          </div>
          
          <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-2">
            {isProjectAdmin && (
              <button
                onClick={() => setShowAddMember(true)}
                className="flex items-center gap-2 rounded-xl bg-indigo-500/10 px-4 py-2 text-xs font-bold text-indigo-400 hover:bg-indigo-500/20 transition-all border border-indigo-500/20"
              >
                <UserPlus className="h-4 w-4" />
                Invite
              </button>
            )}
            <button 
              onClick={() => openCreate('todo')}
              className="btn-primary py-2 px-5 text-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Task
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
        {COLUMNS.map((status) => {
          const colTasks = tasks.filter((t) => t.status === status);
          const Icon = columnIcons[status];
          
          return (
            <motion.div 
              key={status} 
              variants={containerVariants}
              className={`flex flex-col h-full min-h-[500px] rounded-[2rem] bg-white/[0.02] border ${columnGlows[status]} p-4 backdrop-blur-sm`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-white/5 ${iconColors[status]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">{statusLabels[status]}</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{colTasks.length} Tasks</p>
                  </div>
                </div>
                <button 
                  onClick={() => openCreate(status)} 
                  className="rounded-xl p-1.5 text-slate-500 hover:bg-white/5 hover:text-white transition-all"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              {/* Task List */}
              <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-1">
                <AnimatePresence mode="popLayout">
                  {colTasks.map((task) => (
                    <motion.div 
                      key={task._id} 
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="group relative rounded-2xl border border-white/5 bg-slate-900/40 p-4 hover:border-white/10 hover:bg-slate-900/60 transition-all shadow-xl"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h4 className="text-sm font-bold text-white leading-tight group-hover:text-indigo-300 transition-colors">{task.title}</h4>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => handleDeleteTask(task._id)} className="p-1 text-slate-500 hover:text-rose-400">
                             <Trash2 className="h-3.5 w-3.5" />
                           </button>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="text-xs text-slate-400 mb-4 line-clamp-2 font-medium">{task.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className={`px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-widest ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {task.dueDate && (
                            <div className={`flex items-center gap-1 text-[10px] font-bold ${isOverdue(task.dueDate) && task.status !== 'completed' ? 'text-rose-400' : 'text-slate-500'}`}>
                              <Calendar className="h-3 w-3" />
                              {formatDate(task.dueDate)}
                            </div>
                          )}
                          {task.assignee && (
                            <div 
                              className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[8px] font-black text-white ring-2 ring-slate-900 shadow-lg" 
                              title={task.assignee.name}
                            >
                              {getInitials(task.assignee.name)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Hover Actions: Move Task */}
                      <div className="absolute inset-x-0 -bottom-2 flex justify-center opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 z-10">
                        <div className="flex gap-1 bg-slate-800 border border-white/10 rounded-xl p-1 shadow-2xl backdrop-blur-xl">
                          {COLUMNS.filter(s => s !== status).map(s => (
                            <button 
                              key={s} 
                              onClick={() => handleStatusChange(task._id, s)}
                              title={`Move to ${statusLabels[s]}`}
                              className="px-2 py-1 text-[9px] font-black text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all border border-transparent hover:border-white/5 uppercase"
                            >
                              {statusLabels[s].split(' ')[0]}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {colTasks.length === 0 && (
                   <div className="py-12 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl opacity-30 group">
                      <Icon className="w-8 h-8 text-slate-600 mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Empty</p>
                   </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={`New Task — ${statusLabels[createStatus]}`}>
        <form onSubmit={handleCreate} className="space-y-6 p-2">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Task Title</label>
            <input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required 
              placeholder="What needs to be done?"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-medium" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Notes</label>
            <textarea 
              value={desc} 
              onChange={(e) => setDesc(e.target.value)} 
              rows={3} 
              placeholder="Add some details..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all resize-none font-medium" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Priority</label>
              <select 
                value={priority} 
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all appearance-none cursor-pointer"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Deadline</label>
              <input 
                type="date" 
                value={dueDate} 
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all" 
              />
            </div>
          </div>
          
          <button type="submit" className="w-full btn-primary py-4 mt-4 text-lg">
            Create Task
          </button>
        </form>
      </Modal>

      {/* Members Modal */}
      <Modal isOpen={showMembers} onClose={() => setShowMembers(false)} title="Project Squad">
        <div className="space-y-6">
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {currentProject?.members.map((member) => (
              <div key={member.user._id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-black text-xs text-white shadow-lg">
                    {getInitials(member.user.name)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{member.user.name}</p>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{member.role}</p>
                  </div>
                </div>
                {isProjectAdmin && member.user._id !== currentProject?.owner?._id && (
                  <button 
                    onClick={() => handleRemoveMember(member.user._id)} 
                    className="text-slate-500 hover:text-rose-400 p-2 rounded-xl hover:bg-rose-500/10 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Add Member Modal */}
      <Modal isOpen={showAddMember} onClose={() => setShowAddMember(false)} title="Invite Team Member">
        <div className="space-y-6">
          <p className="text-sm text-slate-400 font-medium px-1">Expand your squad. Select a team member to add.</p>
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {allUsers
              .filter(u => !currentProject?.members.some(m => m.user._id === u.id))
              .map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleAddMember(u.id)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-xs text-slate-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      {getInitials(u.name)}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">{u.name}</p>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{u.email}</p>
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 group-hover:bg-indigo-500 transition-all">
                    <UserPlus className="h-4 w-4 text-slate-400 group-hover:text-white" />
                  </div>
                </button>
              ))}
            {allUsers.filter(u => !currentProject?.members.some(m => m.user._id === u.id)).length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl">
                <Users className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-sm text-slate-500 font-bold italic">The whole team is already here!</p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
