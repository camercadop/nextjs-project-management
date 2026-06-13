import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

declare global {
    var prisma: PrismaClient | undefined
}

const adapter = new PrismaLibSql({ url: 'file:./prisma/dev.db' })

export const prisma = global.prisma || new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma
}
