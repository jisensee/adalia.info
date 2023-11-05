import { PrismaClient } from '@prisma/client'
import cursorStream from 'prisma-cursorstream'

const makeClient = () =>
  new PrismaClient({
    log: ['error', 'info'],
  }).$extends(cursorStream)

export type PrismaClientType = ReturnType<typeof makeClient>

declare global {
  // eslint-disable-next-line no-var
  var db: PrismaClientType | undefined
}

export const db = global.db || makeClient()

if (process.env.NODE_ENV !== 'production') {
  global.db = db
}
