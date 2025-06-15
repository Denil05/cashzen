# Expense Tracker

A modern, full-stack expense tracking application built with Next.js that helps users manage their finances effectively. This application provides a seamless experience for tracking income, expenses, and analyzing financial data with a beautiful, responsive interface.

## 🌟 Features

### Authentication & Security
- Secure user authentication using Clerk
- Protected routes and API endpoints
- Advanced security measures with Arcjet
- Session management and user profiles

### Expense Management
- Add, edit, and delete transactions
- Categorize expenses and income
- Add custom categories
- Transaction history with search and filters
- Bulk transaction operations

### Financial Analytics
- Real-time expense tracking
- Monthly and yearly financial reports
- Visual charts and graphs
- Expense breakdown by category
- Income vs. Expense analysis

### User Experience
- Responsive design for all devices
- Dark/Light mode support
- Intuitive and clean interface
- Fast and smooth performance
- Offline support capabilities

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **State Management**: React Hooks
- **Form Handling**: React Hook Form
- **Data Validation**: Zod

### Backend
- **Authentication**: Clerk
- **Security**: Arcjet
- **Database**: Supabase
- **ORM**: Prisma
- **API**: Next.js API Routes

### Development Tools
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Husky for git hooks

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or later
- npm or yarn
- Supabase account
- Clerk account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/expensetracker.git
cd expensetracker
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
DATABASE_URL=your_supabase_database_url
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

```
expensetracker/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (auth)/           # Authentication routes
│   └── (dashboard)/      # Dashboard routes
├── components/            # Reusable components
│   ├── ui/               # UI components
│   └── forms/            # Form components
├── lib/                   # Utility functions
│   ├── utils/            # Helper functions
│   └── validations/      # Form validations
├── prisma/               # Database schema
├── public/               # Static assets
└── styles/              # Global styles
```

## 🔧 Configuration

### Database Schema
The application uses Prisma with the following main models:
- User
- Transaction
- Category
- Budget

### Authentication Flow
1. User signs up/logs in using Clerk
2. Session is maintained securely
3. Protected routes are handled automatically
4. User profile data is synced with the database

## 📚 Documentation

For detailed documentation about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Shadcn UI Documentation](https://ui.shadcn.com/)

## 🚀 Deployment

The application can be deployed on Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/expensetracker)

### Deployment Steps
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables
4. Deploy!

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.