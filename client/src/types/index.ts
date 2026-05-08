export interface User {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  avatar: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ProjectMember {
  user: User;
  role: 'admin' | 'member';
  joinedAt: string;
}

export interface TaskCounts {
  total: number;
  todo: number;
  'in-progress': number;
  'in-review': number;
  completed: number;
}

export interface Project {
  _id: string;
  id: string;
  name: string;
  description: string;
  owner: User;
  members: ProjectMember[];
  color: string;
  status: 'active' | 'archived' | 'completed';
  taskCounts?: TaskCounts;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'todo' | 'in-progress' | 'in-review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  _id: string;
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  project: string | Project;
  assignee: User | null;
  createdBy: User;
  dueDate: string | null;
  tags: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  statusStats: { _id: string; count: number }[];
  priorityStats: { _id: string; count: number }[];
  timeline: { _id: string; count: number }[];
  overdue: number;
  total: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
