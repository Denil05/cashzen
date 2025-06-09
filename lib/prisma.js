import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

const prismaClientSingleton = () => {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  return globalForPrisma.prisma;
};

export const db = prismaClientSingleton();

//globalForPrisma.prisma: This global variable ensures that the Prisma Client instance is reused after hot reloads during development. 
// witout this,each time your application reloads, a new instance of the prisma client would be created, potentially leading to connection issues.