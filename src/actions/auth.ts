'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

const JWT_SECRET = process.env.JWT_SECRET || '';
if (!JWT_SECRET) {
  console.warn('CRITICAL SECURITY WARNING: JWT_SECRET environment variable is not defined.');
}

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  if (!JWT_SECRET) {
    console.error('Login error: JWT_SECRET is not configured');
    return {
      success: false,
      error: 'Server auth is misconfigured (JWT_SECRET missing).',
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: 'Invalid email or password.' };
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return { success: false, error: 'Invalid email or password.' };
    }

    // Create JWT Token
    const secret = new TextEncoder().encode(JWT_SECRET);
    const alg = 'HS256';

    const jwt = await new SignJWT({ id: user.id, email: user.email, name: user.name })
      .setProtectedHeader({ alg })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    // Set HTTP-only cookie
    cookies().set('auth_token', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    const message = error instanceof Error ? error.message : '';
    // Surface DB path / missing-file errors clearly on production demos
    if (
      message.includes('Unable to open') ||
      message.includes('does not exist') ||
      message.includes('SQLITE') ||
      message.includes('P1001') ||
      message.includes('P1003')
    ) {
      return {
        success: false,
        error: 'Database unavailable on server. Ensure DATABASE_URL and seeded prisma/dev.db are deployed.',
      };
    }
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function logoutAction() {
  cookies().delete('auth_token');
  redirect('/login');
}

async function getCurrentUserId() {
  const token = cookies().get('auth_token')?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await import('jose').then((m) => m.jwtVerify(token, secret));
    return payload.id as string;
  } catch (e) {
    return null;
  }
}

export async function getCurrentUserAction() {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;
    return {
      name: user.name,
      email: user.email,
    };
  } catch (e) {
    return null;
  }
}

export async function updateUserAction(name: string, email: string, newPassword?: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: 'Unauthorized' };
  
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== userId) {
      return { success: false, error: 'Email is already in use.' };
    }
    
    const updateData: any = { name, email };
    
    if (newPassword) {
      if (newPassword.length < 6) return { success: false, error: 'Password must be at least 6 characters.' };
      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    // Invalidate cached server payloads that render the user's name so the
    // dashboard greeting ("Hello <name>") reflects the save immediately.
    // The Server Action response carries the refreshed RSC payload for the
    // current route, so the UI updates without a full page reload.
    revalidatePath('/');
    revalidatePath('/people');

    return {
      success: true,
      user: { name: updatedUser.name, email: updatedUser.email },
    };
  } catch (e) {
    console.error('Update user error:', e);
    return { success: false, error: 'Failed to update user details.' };
  }
}
