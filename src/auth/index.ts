import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { verifyParentCredentials } from './verify-credentials';

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const parent = await verifyParentCredentials(credentials?.email, credentials?.password);
        if (!parent) return null;
        return { id: parent.userId, email: parent.email, householdId: parent.householdId };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.householdId = (user as { householdId: string }).householdId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.householdId = token.householdId as string;
      }
      return session;
    },
  },
});
