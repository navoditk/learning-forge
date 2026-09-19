import { z } from 'zod';

import { hashPassword } from '../src/auth/verify-credentials';
import { prisma } from '../src/server/prisma';

export const ResetParentPasswordInputSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(200),
});

export type ResetParentPasswordInput = z.infer<typeof ResetParentPasswordInputSchema>;

export type ResetParentPasswordResult =
  { status: 'reset'; email: string } | { status: 'not_found' };

export async function resetParentPassword(
  input: ResetParentPasswordInput,
): Promise<ResetParentPasswordResult> {
  const parsed = ResetParentPasswordInputSchema.parse(input);
  const parent = await prisma.user.findUnique({ where: { email: parsed.email } });
  if (!parent || parent.role !== 'PARENT' || !parent.passwordHash) {
    return { status: 'not_found' };
  }

  await prisma.user.update({
    where: { id: parent.id },
    data: { passwordHash: await hashPassword(parsed.password) },
  });

  return { status: 'reset', email: parsed.email };
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
  const args = parseArgs(process.argv.slice(2));
  const parsed = ResetParentPasswordInputSchema.safeParse({
    email: args.email,
    password: process.env.LEARNING_FORGE_NEW_PASSWORD,
  });
  if (!parsed.success) {
    console.error('Invalid reset input:', parsed.error.flatten().fieldErrors);
    console.error(
      'Set LEARNING_FORGE_NEW_PASSWORD securely, then run: npm run reset-parent-password -- --email=parent@example.com',
    );
    process.exitCode = 1;
    return;
  }

  const result = await resetParentPassword(parsed.data);
  if (result.status === 'not_found') {
    console.error('No password-enabled parent account matches that email.');
    process.exitCode = 1;
    return;
  }

  console.log(`Reset password for parent account ${result.email}.`);
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
