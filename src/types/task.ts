// src/types/task.ts
export type TaskStatus = 'backlog' | 'todo' | 'in-progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  dueDate?: string;
  projectId: string;
  timeSpent: number; // в минутах
  createdAt: string;
}

// src/types/project.ts
export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  members: string[];
  createdAt: string;
}