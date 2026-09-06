/**
 * One-time provisioning script for the single real household this product
 * serves (ADR-0008). Not a signup flow: there is no UI for this, by design.
 *
 * Usage:
 *   npm run create-parent-account -- --email=parent@example.com --password=... --grade=6
 *
 * Refuses to run if a real parent account already exists, unless --force is
 * passed.
 */
import { z } from 'zod';

import { hashPassword } from '../src/auth/verify-credentials';
import { prisma } from '../src/server/prisma';

export const CreateParentAccountInputSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(200),
  grade: z.coerce.number().int().min(1).max(12).default(6),
  force: z.boolean().default(false),
});

export type CreateParentAccountInput = z.infer<typeof CreateParentAccountInputSchema>;

export type CreateParentAccountResult =
  | { status: 'created'; householdId: string; email: string; learnerProfileId: string }
  | { status: 'refused'; reason: string };

export async function createParentAccount(
  input: CreateParentAccountInput,
): Promise<CreateParentAccountResult> {
  // Checks for an existing *real* parent account specifically (email set),
  // not just any household row - the synthetic fixture (ADR-0003) also
  // creates a household, in dev/test databases, that this must not collide
  // with.
  const existingParent = await prisma.user.findFirst({
    where: { role: 'PARENT', email: { not: null } },
  });
  if (existingParent && !input.force) {
    return {
      status: 'refused',
      reason: `A real parent account already exists (${existingParent.email}). This product is scoped to a single household (ADR-0008). Pass --force to create another anyway.`,
    };
  }

  const passwordHash = await hashPassword(input.password);

  const result = await prisma.$transaction(async (tx) => {
    const household = await tx.household.create({ data: {} });
    await tx.user.create({
      data: { householdId: household.id, role: 'PARENT', email: input.email, passwordHash },
    });
    const learnerUser = await tx.user.create({
      data: { householdId: household.id, role: 'LEARNER' },
    });
    const learnerProfile = await tx.learnerProfile.create({
      data: { userId: learnerUser.id, householdId: household.id, gradeLevel: input.grade },
    });
    return { household, learnerProfile };
  });

  return {
    status: 'created',
    householdId: result.household.id,
    email: input.email,
    learnerProfileId: result.learnerProfile.id,
  };
}

function parseArgs(argv: string[]): Record<string, string | boolean> {
  const parsed: Record<string, string | boolean> = {};
  for (const arg of argv) {
    if (!arg.startsWith('--')) continue;
    const [key, ...rest] = arg.slice(2).split('=');
    parsed[key] = rest.length > 0 ? rest.join('=') : true;
  }
  return parsed;
}

async function main() {
  const rawArgs = parseArgs(process.argv.slice(2));
  const parsedArgs = CreateParentAccountInputSchema.safeParse(rawArgs);
  if (!parsedArgs.success) {
    console.error('Invalid arguments:', parsedArgs.error.flatten().fieldErrors);
    console.error(
      'Usage: npm run create-parent-account -- --email=parent@example.com --password=... [--grade=6] [--force]',
    );
    process.exitCode = 1;
    return;
  }

  const result = await createParentAccount(parsedArgs.data);
  if (result.status === 'refused') {
    console.error(result.reason);
    process.exitCode = 1;
    return;
  }

  console.log(`Created household ${result.householdId}`);
  console.log(`Parent account: ${result.email} (sign in at /login)`);
  console.log(`Learner profile: ${result.learnerProfileId} (grade ${parsedArgs.data.grade})`);
}

if (require.main === module) {
  main()
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
