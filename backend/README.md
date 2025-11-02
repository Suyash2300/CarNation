# CarNation Backend

A Node.js backend API built with Express, TypeScript, and Prisma ORM.

## Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **Prisma** - Modern ORM for PostgreSQL
- **PostgreSQL** - Database (Neon)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (configured via DATABASE_URL in .env)

### Installation

```bash
# Install dependencies
npm install

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed the database

## Project Structure

```
backend/
├── src/
│   ├── db/
│   │   └── prisma.ts      # Prisma client instance
│   └── server.ts           # Express server entry point
├── prisma/
│   └── schema.prisma       # Prisma schema
├── dist/                   # Compiled TypeScript (generated)
├── .env                    # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
PORT=3000
NODE_ENV=development
```

## API Endpoints

- `GET /health` - Health check endpoint
- `GET /api` - API welcome message

## Database

Prisma is configured to use PostgreSQL. Update the schema in `prisma/schema.prisma` and run migrations:

```bash
npm run prisma:migrate
```

To view your database in a GUI:

```bash
npm run prisma:studio
```

This opens Prisma Studio at `http://localhost:5555`.

