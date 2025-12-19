import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { FastifyInstance } from 'fastify';
import { getPrismaClient, NotFoundError, ValidationError, AuthenticationError } from '../../utils/database.js';
import { LoginInput, InviteUserInput, ChangePasswordInput } from './auth.schema.js';
import { Role } from '../../generated/client.js';
import { emailService } from '../../services/email.service.js';

const prisma = getPrismaClient();

export async function login(input: LoginInput, app: FastifyInstance) {
  const { email, password } = input;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid email or password');
  }

  const token = app.jwt.sign({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}

export async function inviteUser(input: InviteUserInput) {
  const { email, name, role } = input;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ValidationError('User with this email already exists');
  }

  // Generate random password
  const tempPassword = crypto.randomBytes(8).toString('hex');
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role: role as Role,
    },
  });

  // Send email asynchronously - don't block on email failure
  // User is already created in database, email is best-effort
  emailService.sendInvitationEmail(email, tempPassword).catch((err) => {
    console.error(`Failed to send invitation email to ${email}:`, err);
    // Could log to monitoring service, sentry, etc.
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function changePassword(userId: string, input: ChangePasswordInput) {
  const { currentPassword, newPassword } = input;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User', userId);
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!isPasswordValid) {
    throw new ValidationError('Invalid current password');
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  });

  return { message: 'Password updated successfully' };
}
