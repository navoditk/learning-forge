import { getTutorUsageReport } from '../src/phase1/tutor-usage-report';

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const days = Number.parseInt(argument('--days') ?? '7', 10);
  const report = await getTutorUsageReport({
    days,
    limits: {
      householdDaily: Number.parseInt(process.env.TUTOR_DAILY_HINT_LIMIT ?? '100', 10),
      session: Number.parseInt(process.env.TUTOR_SESSION_HINT_LIMIT ?? '8', 10),
    },
  });
  console.log(JSON.stringify(report, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    const { prisma } = await import('../src/server/prisma');
    await prisma.$disconnect();
  });
