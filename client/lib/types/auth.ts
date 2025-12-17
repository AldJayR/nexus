import type { User } from "./models";

export type LoginResponse = {
  token: string;
  user: User;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type InviteUserInput = {
  email: string;
  name: string;
  role?: "MEMBER" | "TEAM_LEAD" | "ADVISER";
};

export type InviteUserResponse = {
  message: string;
  credentials?: {
    email: string;
    password: string;
  };
};

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

export type ServerActionResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};
