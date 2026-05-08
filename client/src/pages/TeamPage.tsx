import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, UserCircle, Trash2, ChevronDown } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getInitials, formatDate } from '@/lib/utils';
import type { User } from '@/types';

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
    'from-indigo-500 to-purple-500', 'from-cyan-500 to-blue-500',
    'from-emerald-500 to-teal-500', 'from-orange-500 to-red-500',
    'from-pink-500 to-rose-500', 'from-amber-500 to-yellow-500',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Team</h1>
        <p className="text-text-secondary text-sm mt-1">{users.length} member{users.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {users.map((u, i) => (
          <motion.div key={u.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="group rounded-2xl border border-border bg-surface-light p-5 hover:border-primary/30 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${avatarGradients[i % avatarGradients.length]} text-sm font-bold text-white`}>
                  {getInitials(u.name)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">{u.name}</h3>
                  <p className="text-xs text-text-muted">{u.email}</p>
                </div>
              </div>
              {isAdmin && u.id !== currentUser?.id && (
                <button onClick={() => deleteUser(u.id)}
                  className="rounded-lg p-1.5 text-text-muted hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {u.role === 'admin' ? <Shield className="h-3.5 w-3.5 text-amber-400" /> : <UserCircle className="h-3.5 w-3.5 text-text-muted" />}
                {isAdmin && u.id !== currentUser?.id ? (
                  <select value={u.role} onChange={(e) => updateRole(u.id, e.target.value)}
                    className="bg-transparent text-xs font-medium text-text-secondary border-none focus:outline-none cursor-pointer">
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                  </select>
                ) : (
                  <span className="text-xs font-medium text-text-secondary capitalize">{u.role}</span>
                )}
              </div>
              {u.createdAt && <span className="text-[11px] text-text-muted">Joined {formatDate(u.createdAt)}</span>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
