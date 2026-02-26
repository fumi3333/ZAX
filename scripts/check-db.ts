import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.geminiLog.findMany({
    where: { type: 'error' },
    orderBy: { createdAt: 'desc' },
    take: 3
  });
  console.log(JSON.stringify(logs, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
