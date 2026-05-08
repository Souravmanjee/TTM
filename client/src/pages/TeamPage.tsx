import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, UserCircle, Trash2, ChevronDown, Mail, Calendar as CalendarIcon, Users } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getInitials, formatDate } from '@/lib/utils';
import type { User } from '@/types';

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function TeamPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data);
    } finally { setLoading(false); }
  };

  const updateRole = async (userId: string, role: string) => {
    await api.put(`/users/${userId}/role`, { role });
    loadUsers();
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Remove this team member?')) return;
    await api.delete(`/users/${userId}`);
    loadUsers();
  };

  if (loading) return <LoadingSpinner />;

  const avatarGradients = [
    'from-indigo-500 to-purple-500', 
    'from-cyan-500 to-blue-500',
    'from-emerald-500 to-teal-500', 
    'from-orange-500 to-red-500',
    'from-pink-500 to-rose-500', 
    'from-amber-500 to-yellow-500',
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 pb-20"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Network</h1>
          <p className="text-slate-400 font-medium">Manage your team and permissions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10">
        <AnimatePresence mode="popLayout">
          {users.map((u, i) => (
            <motion.div 
              key={u._id || u.id} 
              layout
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
              className="group relative rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-6 hover:border-white/10 hover:bg-white/[0.04] transition-all shadow-xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl -mr-16 -mt-16" />
              
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${avatarGradients[i % avatarGradients.length]} text-lg font-black text-white shadow-lg transform group-hover:scale-105 transition-transform`}>
                    {getInitials(u.name)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">{u.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                       <Mail className="w-3 h-3 text-slate-500" />
                       <p className="text-xs text-slate-500 font-medium">{u.email}</p>
                    </div>
                  </div>
                </div>
                {isAdmin && (u._id !== currentUser?._id && u.id !== currentUser?.id) && (
                  <button 
                    onClick={() => deleteUser(u._id || u.id)}
                    className="rounded-xl p-2 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${u.role === 'admin' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-500'}`}>
                    {u.role === 'admin' ? <Shield className="h-4 w-4" /> : <UserCircle className="h-4 w-4" />}
                  </div>
                  
                  {isAdmin && (u._id !== currentUser?._id && u.id !== currentUser?.id) ? (
                    <div className="relative flex items-center group/select">
                      <select 
                        value={u.role} 
                        onChange={(e) => updateRole(u._id || u.id, e.target.value)}
                        className="bg-transparent text-xs font-black text-slate-400 uppercase tracking-widest border-none focus:outline-none cursor-pointer appearance-none pr-4"
                      >
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                      </select>
                      <ChevronDown className="w-3 h-3 text-slate-600 absolute right-0 pointer-events-none" />
                    </div>
                  ) : (
                    <span className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">{u.role}</span>
                  )}
                </div>
                
                {u.createdAt && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                    <CalendarIcon className="w-3 h-3" />
                    {formatDate(u.createdAt)}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {users.length === 0 && (
         <div className="text-center py-24 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
            <Users className="h-12 w-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-bold italic">No team members found</p>
         </div>
      )}
    </motion.div>
  );
}
