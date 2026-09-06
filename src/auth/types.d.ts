import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & { householdId: string };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    householdId?: string;
  }
}
