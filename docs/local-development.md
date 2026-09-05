# Local development database

LF-0.4 uses PostgreSQL locally through the approved Prisma boundary. The
configuration below is for synthetic local development only. Do not place
production credentials, learner data, or provider credentials in `.env` files
or the repository.

## Start and migrate

```bash
cp .env.example .env
docker compose up -d db
npm run db:generate
npm run db:deploy
npm run db:seed
```

`DATABASE_URL` is read from the local environment. The compose service uses
trust authentication and must not be exposed beyond a developer machine.

## Roll back the initial migration

The migration has a reviewed `down.sql` because Prisma does not provide a
first-class down-migration command. Run the rollback only against this local
synthetic database:

```bash
npm run db:rollback
```

The rollback removes the LF-0.4 tables and migration record. It is not a
production deletion workflow; retention, export, and account deletion remain
pending the human decisions recorded in ADR-0001.

## Persistence checks

`npm run db:validate` validates the Prisma schema without connecting to a
database. `npm run db:deploy` applies reviewed migrations. The seed is
synthetic and repeatable. Persistence integration tests require a reachable
`DATABASE_URL`; they are kept separate from the default application test
command so a missing local database fails explicitly rather than silently
pretending persistence was verified.

Run them after starting and migrating the local database:

```bash
npm run test:integration
```
