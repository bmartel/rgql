This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Quick Setup

This will perform all the below commands in sequence, and have a fully running application stack in one command.

```bash
make dev
```

open http://localhost:3000

## Install dependencies

```bash
yarn install
```

## Copy sample .env

```bash
make envfile
```

## Setup Dgraph

Create the db

```bash
make dgraph
```

Create + migrate initial db schema

```bash
make migrate
```

Generate typescript types from schema

```bash
yarn graphql:types
```

## Development server

First, run the development server:

```bash
yarn dev
```

## PWA assets

Generate and update pwa assets to point your logo (defaults to nextjs logo)

```bash
make pwa SVG_PATH=/path/to/logo.svg
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

### NextJS

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

### Dgraph

- [Dgraph Overview](https://dgraph.io/docs/dgraph-overview/) - documentation overview.
- [Message Board Tutorial](https://dgraph.io/learn/courses/messageboardapp/react/overview/introduction/) - react focused tutorial on using dgraph.

### NextAuth

- [NextAuth Introduction](https://next-auth.js.org/getting-started/introduction) - general introduction to usage
- [SSR Configuration](https://next-auth.js.org/tutorials/securing-pages-and-api-routes) - how to secure and configure pages/api routes

### Twin.Macro

- [GitHub Repo](https://github.com/ben-rogerson/twin.macro)

### Stitches

- [Documentation Introduction](https://stitches.dev/docs/introduction)
- [GitHub Repo](https://github.com/modulz/stitches)

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
