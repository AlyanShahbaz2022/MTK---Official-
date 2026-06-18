import type { Role } from '@prisma/client';
import type { DefaultSession } from 'next-auth';

// Augment Auth.js types with our custom fields (id + RBAC role).
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession['user'];
  }

  interface User {
    role: Role;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: Role;
  }
}
