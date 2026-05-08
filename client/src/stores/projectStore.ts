import { create } from 'zustand';
import api from '@/lib/api';
import type { Project } from '@/types';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  createProject: (data: { name: string; description?: string; color?: string }) => Promise<Project>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addMember: (projectId: string, userId: string, role?: string) => Promise<void>;
  removeMember: (projectId: string, userId: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,

  fetchProjects: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/projects');
      set({ projects: res.data.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchProject: async (id: string) => {
    set({ isLoading: true });
    try {
      const res = await api.get(`/projects/${id}`);
      set({ currentProject: res.data.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  createProject: async (data) => {
    const res = await api.post('/projects', data);
    const project = res.data.data;
    set({ projects: [project, ...get().projects] });
    return project;
  },

  updateProject: async (id, data) => {
    const res = await api.put(`/projects/${id}`, data);
    const updated = res.data.data;
    set({
      projects: get().projects.map((p) => (p._id === id ? { ...p, ...updated } : p)),
      currentProject: get().currentProject?._id === id ? updated : get().currentProject,
    });
  },

  deleteProject: async (id) => {
    await api.delete(`/projects/${id}`);
    set({
      projects: get().projects.filter((p) => p._id !== id),
      currentProject: get().currentProject?._id === id ? null : get().currentProject,
    });
  },

  addMember: async (projectId, userId, role = 'member') => {
    const res = await api.post(`/projects/${projectId}/members`, { userId, role });
    const updated = res.data.data;
    set({
      projects: get().projects.map((p) => (p._id === projectId ? { ...p, ...updated } : p)),
      currentProject: get().currentProject?._id === projectId ? updated : get().currentProject,
    });
  },

  removeMember: async (projectId, userId) => {
    const res = await api.delete(`/projects/${projectId}/members/${userId}`);
    const updated = res.data.data;
    set({
      projects: get().projects.map((p) => (p._id === projectId ? { ...p, ...updated } : p)),
      currentProject: get().currentProject?._id === projectId ? updated : get().currentProject,
    });
  },
}));
