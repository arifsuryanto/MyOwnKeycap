import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@keycap/db';

/**
 * Auth.js v5 configuration
 *
 * - Google OAuth (PKCE + state automatic via Auth.js)
 * - Database sessions via Prisma adapter
 * - Only verified emails allowed (D1)
 * - RBAC via session callback
 * - Strict cookie settings (__Host- prefix)
 *
 * See: KEYCAP_PLATFORM_SPEC.md Section 5.1
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      authorization: {
        params: {
          scope: 'openid email profile',
          prompt: 'consent',
          access_type: 'offline',
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ account, profile }) {
      // Only allow verified Google emails
      if (account?.provider === 'google') {
        return profile?.email_verified === true;
      }
      return true;
    },

    async session({ session, user }) {
      // Attach user ID and role to session
      if (session.user) {
        session.user.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, creditBalance: true },
        });
        session.user.role = dbUser?.role ?? 'USER';
        session.user.creditBalance = dbUser?.creditBalance ?? 0;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours — rotate session
  },

  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === 'production'
          ? '__Host-next-auth.session-token'
          : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  events: {
    async createUser({ user }) {
      // Auto-assign ADMIN role if email is in ADMIN_EMAILS
      const adminEmails = (process.env.ADMIN_EMAILS ?? '')
        .split(',')
        .map((e) => e.trim().toLowerCase());
      if (user.id && user.email && adminEmails.includes(user.email.toLowerCase())) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: 'ADMIN' },
        });
      }
    },
  },
});

/**
 * Extended session types for TypeScript
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: 'USER' | 'OPERATOR' | 'ADMIN';
      creditBalance: number;
    };
  }
}
