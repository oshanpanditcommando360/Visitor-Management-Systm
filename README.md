This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

Copy `.env.example` to `.env` and fill in the required values before running the development server.

Install dependencies with `npm install`. This step generates the Prisma Client automatically. If you later modify `prisma/schema.prisma`, run `npx prisma generate` to update the client.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Setup

1. Copy `.env.example` to `.env` and provide values.
2. Install dependencies, which runs `prisma generate`:

   ```bash
   npm install
   ```

   This creates `lib/generated/prisma` containing the query engine.
3. Apply database migrations:

   ```bash
   npx prisma migrate deploy
   # or for development
   npx prisma migrate dev
   ```

Production deployments require the `DATABASE_URL`, `DIRECT_URL`, and `JWT_SECRET` environment variables.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

## Building for production

Run the build command:
```bash
npm run build
```

This runs a "postbuild" script that copies the Prisma client from `node_modules/.prisma` and `lib/generated/prisma` into `.next/standalone` so the runtime can find the `query-engine-*` binaries.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
