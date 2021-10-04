This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

Uses [NextAuth](https://next-auth.js.org/getting-started/introduction)

SSR configuration
https://next-auth.js.org/tutorials/securing-pages-and-api-routes

## Install dependencies

```bash
yarn install
```

## Copy sample .env

```bash
cp .env.example .env
```

## Setup Graphql + Postgres

Start postgres + graphql

```bash
docker-compose -f graphql/docker-compose.yml up -d
```

Create the development db

```bash
docker-compose -f graphql/docker-compose.yml run api db create
```

Create + migrate initial db schema

```bash
yarn prisma:init
```

Restart the api to pickup graphql changes (it will have crashed with no tables on initial migration)

```bash
docker-compose -f graphql/docker-compose.yml restart api
```

## Getting Started

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
