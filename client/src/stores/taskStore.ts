import { create } from 'zustand';
import api from '@/lib/api';
import type { Task, TaskStats } from '@/types';

interface TaskState {
  tasks: Task[];
  stats: TaskStats | null;
  isLoading: boolean;
  fetchTasks: (params?: Record<string, string>) => Promise<void>;
  fetchStats: (projectId?: string) => Promise<void>;
  createTask: (data: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, data: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  reorderTasks: (tasks: { id: string; status: string; order: number }[]) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  stats: null,
  isLoading: false,

  fetchTasks: async (params) => {
    set({ isLoading: true });
    try {
      const res = await api.get('/tasks', { params });
      set({ tasks: res.data.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchStats: async (projectId) => {
    try {
      const params = projectId ? { project: projectId } : {};
      const res = await api.get('/tasks/stats', { params });
      set({ stats: res.data.data });
    } catch (error) {
      throw error;
    }
  },

  createTask: async (data) => {
    const res = await api.post('/tasks', data);
    const task = res.data.data;
    set({ tasks: [...get().tasks, task] });
    return task;
  },

  updateTask: async (id, data) => {
    const res = await api.put(`/tasks/${id}`, data);
    const updated = res.data.data;
    set({ tasks: get().tasks.map((t) => (t._id === id ? updated : t)) });
    return updated;
  },

  deleteTask: async (id) => {
    await api.delete(`/tasks/${id}`);
    set({ tasks: get().tasks.filter((t) => t._id !== id) });
  },

  reorderTasks: async (tasks) => {
    await api.put('/tasks/reorder', { tasks });
  },
}));
