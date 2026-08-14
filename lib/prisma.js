
import { PrismaClient } from './generated/prisma'
import { PrismaNeon } from '@prisma/adapter-neon'
import { neonConfig } from '@neondatabase/serverless'

import ws from 'ws'
neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = true;

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set')
}

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
})

export const prisma = new PrismaClient({ adapter })
