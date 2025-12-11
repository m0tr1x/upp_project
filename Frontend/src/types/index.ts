export interface Task {
  id: string;
  title: string;
  description: string;
  project: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  createdDate: string;
  dueTime?: string;
}

export interface Project {
  id: string;
  name: string;
  timeSpent: string; // "004:000" формат
}