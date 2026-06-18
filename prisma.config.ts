import path from 'node:path';
import { config as loadEnv } from 'dotenv';
import type { PrismaConfig } from 'prisma';

// prisma.config.ts disables Prisma's automatic env loading, so load
// .env.local (then .env) ourselves for the CLI (migrate/seed/studio).
loadEnv({ path: '.env.local' });
loadEnv({ path: '.env' });

export default {
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
} satisfies PrismaConfig;
