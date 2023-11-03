import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var db: PrismaClient | undefined
}

export const db =
  global.db ||
  new PrismaClient({
    log: ['error'],
    // env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  global.db = db
}
