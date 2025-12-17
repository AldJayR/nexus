// Core Types matching server Prisma schema

export enum UserRole {
  MEMBER = "MEMBER",
  TEAM_LEAD = "TEAM_LEAD",
  ADVISER = "ADVISER",
}

export enum PhaseType {
  WATERFALL = "WATERFALL",
  SCRUM = "SCRUM",
  FALL = "FALL",
}

export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  BLOCKED = "BLOCKED",
  DONE = "DONE",
}

export enum DeliverableStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  REVIEW = "REVIEW",
  COMPLETED = "COMPLETED",
}

// User
export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

// Project
export type Project = {
  id: string;
  name: string;
  description?: string | null;
  repositoryUrl?: string | null;
  startDate: string;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
};

// Phase
export type Phase = {
  id: string;
  projectId: string;
  type: PhaseType;
  name: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
};

export interface PhaseDetail extends Phase {
  deliverables: Deliverable[];
}

// Deliverable
export type Deliverable = {
  id: string;
  phaseId: string;
  title: string;
  description?: string | null;
  status: DeliverableStatus;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

// Sprint
export type Sprint = {
  id: string;
  projectId: string;
  number: number;
  goal?: string | null;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type SprintProgress = {
  totalTasks: number;
  completedTasks: number;
  percentage: number;
};

// Task
export type Task = {
  id: string;
  sprintId: string;
  assigneeId?: string | null;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

// Comment
export type Comment = {
  id: string;
  content: string;
  authorId: string;
  taskId?: string | null;
  deliverableId?: string | null;
  createdAt: string;
  updatedAt: string;
};

// Evidence
export type Evidence = {
  id: string;
  deliverableId: string;
  uploaderId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  createdAt: string;
  deletedAt?: string | null;
};

// Meeting Log
export type MeetingLog = {
  id: string;
  sprintId: string;
  title: string;
  date: string;
  fileUrl: string;
  uploaderId: string;
  createdAt: string;
  updatedAt: string;
};

// Activity Log
export type ActivityLog = {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string | null;
  createdAt: string;
};

// Notification
export type Notification = {
  id: string;
  userId: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
};

// Contribution (from getUserContributions)
export type UserContribution = {
  userId: string;
  totalTasks: number;
  completedTasks: number;
  assignedTasks: Task[];
  comments: Comment[];
  uploadedEvidence: Evidence[];
};
