import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    role: z.string(),
  }),
});

export const inviteUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(['MEMBER', 'TEAM_LEAD', 'ADVISER']).default('MEMBER'),
});

export const inviteUserResponseSchema = z.object({
  message: z.string(),
  credentials: z.object({
    email: z.string(),
    password: z.string(),
  }).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
