# Expense Tracker

A modern expense tracking application built with Next.js that helps users manage their finances effectively.

## Features

- User authentication and secure login
- Track income and expenses
- Categorize transactions
- View financial analytics and reports
- Responsive design for all devices

## Tech Stack

- **Framework**: Next.js
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **Security**: Arcjet
- **Database**: Supabase with Prisma ORM
- **UI Components**: Shadcn UI
- **State Management**: React Hooks

## Getting Started

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

## Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
DATABASE_URL=your_supabase_database_url
```

## Project Structure

- `/app` - Main application code
- `/components` - Reusable UI components
- `/lib` - Utility functions and configurations
- `/prisma` - Database schema and migrations

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com/)

## Deployment

The application can be deployed on Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/expensetracker)