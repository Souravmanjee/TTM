import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FolderKanban, Users, CheckCircle2, MoreVertical, Trash2, ArrowUpRight, Search, LayoutGrid, List } from 'lucide-react';
import { useProjectStore } from '@/stores/projectStore';
import Modal from '@/components/Modal';
import LoadingSpinner from '@/components/LoadingSpinner';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: 'spring', stiffness: 100, damping: 15 } 
  },
};

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { projects, fetchProjects, createProject, deleteProject, isLoading } = useProjectStore();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { 
    fetchProjects(); 
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createProject({ name, description: desc, color });
    setShowCreate(false); 
    setName(''); 
    setDesc(''); 
    setColor(COLORS[0]);
    fetchProjects();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      await deleteProject(id); 
      setMenuOpen(null);
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading && projects.length === 0) return <LoadingSpinner />;

  return (
    <div className="space-y-10 relative pb-20">
      {/* Background Decor */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Projects</h1>
          <p className="text-slate-400 font-medium">Manage and track your organization's initiatives</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input 
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 w-full md:w-64 transition-all"
              />
           </div>
           <button 
             onClick={() => setShowCreate(true)} 
             className="btn-primary flex items-center gap-2"
           >
             <Plus className="h-5 w-5" /> 
             <span className="hidden sm:inline">New Project</span>
           </button>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10"
      >
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((p) => {
            const total = p.taskCounts?.total || 0;
            const done = p.taskCounts?.completed || 0;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            
            return (
              <motion.div 
                key={p._id} 
                variants={cardVariants}
                layout
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => navigate(`/projects/${p._id}`)}
                className="group relative rounded-[2rem] border border-white/5 glass-card p-6 cursor-pointer hover:border-indigo-500/30 transition-all duration-300 hover:shadow-premium-hover"
              >
                {/* Accent line */}
                <div className="absolute top-0 left-8 right-8 h-1 rounded-b-full opacity-50 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: p.color }} />
                
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div 
                      className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg relative overflow-hidden" 
                      style={{ backgroundColor: p.color }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-50" />
                      <FolderKanban className="h-6 w-6 text-white relative z-10" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">{p.name}</h3>
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5">
                        <Users className="h-3 w-3" />
                        <span>{p.members?.length || 0} Members</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === p._id ? null : p._id); }}
                      className="rounded-xl p-2 text-slate-500 hover:bg-white/5 hover:text-white transition-all"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    
                    <AnimatePresence>
                      {menuOpen === p._id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-white/10 bg-slate-900/90 backdrop-blur-xl p-2 shadow-2xl z-20"
                        >
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(p._id); }}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" /> Delete Project
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {p.description && (
                  <p className="text-sm text-slate-400 mb-8 line-clamp-2 font-medium leading-relaxed">
                    {p.description}
                  </p>
                )}

                <div className="mt-auto space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-tighter">
                    <span className="text-slate-500">{done} / {total} Tasks Completed</span>
                    <span className="text-indigo-400">{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden p-[1px] border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, ease: "circOut" }}
                      className="h-full rounded-full shadow-lg" 
                      style={{ backgroundColor: p.color }} 
                    />
                  </div>
                </div>
                
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all">
                   <ArrowUpRight className="h-5 w-5 text-indigo-400" />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {filteredProjects.length === 0 && !isLoading && (
        <div className="text-center py-20 bg-white/[0.02] rounded-[3rem] border border-dashed border-white/10 relative z-10">
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-white/5 mb-6 text-slate-700">
            <FolderKanban className="h-12 w-12" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No projects found</h2>
          <p className="text-slate-500 font-medium">Try adjusting your search or create a new project.</p>
        </div>
      )}

      {/* Create Modal - Polished */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Project">
        <form onSubmit={handleCreate} className="space-y-6 p-2">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Project Name</label>
            <input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              placeholder="Enter a descriptive name..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all font-medium" 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Description</label>
            <textarea 
              value={desc} 
              onChange={(e) => setDesc(e.target.value)} 
              rows={3} 
              placeholder="What is this project about?"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all resize-none font-medium" 
            />
          </div>
          
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Visual Identity</label>
            <div className="flex flex-wrap gap-3 p-1">
              {COLORS.map((c) => (
                <button 
                  key={c} 
                  type="button" 
                  onClick={() => setColor(c)}
                  className={`h-10 w-10 rounded-xl transition-all relative overflow-hidden ${color === c ? 'ring-2 ring-white ring-offset-4 ring-offset-slate-900 scale-110 shadow-xl' : 'hover:scale-105 opacity-60 hover:opacity-100'}`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <button 
            type="submit" 
            className="w-full btn-primary py-4 mt-4 text-lg"
          >
            Launch Project
          </button>
        </form>
      </Modal>
    </div>
  );
}
