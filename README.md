# 📊 Productivity App

A comprehensive, modern productivity application built with **Next.js 16**, **React 19**, **Tailwind CSS**, **Supabase**, and **Google Generative AI**. Featuring task management, time blocking, analytics, and AI-powered productivity assistance.

---

## 🚀 Features

### Core Features

- **📋 Task Management** - Create, organize, and track tasks with priority levels
- **🎯 Eisenhower Matrix** - Prioritize tasks using the urgent/important framework
- **⏱️ Pomodoro Timer** - Track focused work sessions with customizable intervals
- **📅 Time Blocking** - Schedule your day with visual time block management
- **📊 Analytics Dashboard** - Track productivity metrics and visualize progress
- **🤖 AI Assistant** - Get productivity recommendations from Google Generative AI
- **💾 Data Persistence** - All data synced to Supabase PostgreSQL database
- **🌙 Dark/Light Mode** - Full theme support with system preference detection
- **📱 Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **🔐 Authentication** - Secure user authentication with Supabase Auth

### Advanced Features

- **📌 Recurring Tasks** - Set up tasks that repeat automatically
- **⏰ Reminders** - Get notified for important tasks
- **📖 Daily Goals** - Track daily objectives with habit checkers
- **💬 Chat Templates** - Pre-built prompts for AI conversations
- **📈 Real-time Analytics** - Day, week, and month-based statistics
- **🎨 Customizable Themes** - Multiple color schemes available
- **⚡ Performance Optimized** - Fast load times and smooth interactions
- **🔄 Real-time Sync** - Instant updates across all tabs/devices

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS 4, Framer Motion |
| **Database** | Supabase PostgreSQL |
| **Auth** | Supabase Auth (Email/Password, OAuth) |
| **AI** | Google Generative AI (Gemini API) |
| **Forms** | React Hook Form, Zod (validation) |
| **State Management** | Zustand |
| **UI Components** | Radix UI, Lucide Icons |
| **Calendar** | FullCalendar, React Big Calendar |
| **Charts** | Recharts |
| **Testing** | Playwright |
| **Drag & Drop** | dnd-kit |

---

## 📋 Project Structure

```
productivity-app/
├── src/
│   ├── app/                          # Next.js app directory
│   │   ├── (auth)/                   # Auth routes (login, signup)
│   │   ├── dashboard/                # Main dashboard page
│   │   ├── ai/                       # AI chat interface
│   │   ├── analytics/                # Analytics dashboard
│   │   ├── eisenhower/               # Eisenhower matrix view
│   │   ├── pomodoro/                 # Pomodoro timer
│   │   ├── time-blocking/            # Time blocking calendar
│   │   ├── daily-goals/              # Daily goals tracker
│   │   ├── recurring-tasks/          # Recurring tasks management
│   │   ├── reminders/                # Reminders management
│   │   └── layout.tsx                # Root layout
│   │
│   ├── components/                   # React components
│   │   ├── ai/                       # AI chat components
│   │   ├── analytics/                # Analytics charts and displays
│   │   ├── common/                   # Shared components (buttons, dialogs)
│   │   ├── daily-goals/              # Daily goals UI components
│   │   ├── eisenhower/               # Eisenhower matrix components
│   │   ├── layout/                   # Layout components (header, sidebar)
│   │   ├── notes/                    # Notes display components
│   │   ├── pomodoro/                 # Pomodoro timer UI
│   │   ├── providers/                # Context providers
│   │   ├── pwa/                      # PWA install prompts
│   │   ├── recurring-tasks/          # Recurring tasks components
│   │   ├── reminders/                # Reminders UI
│   │   ├── time-blocking/            # Time blocking calendar components
│   │   └── ui/                       # Radix UI wrapped components
│   │
│   ├── lib/                          # Utilities and services
│   │   ├── services/                 # Business logic services
│   │   │   ├── ai-service.ts         # AI/Gemini integration
│   │   │   ├── analytics-service.ts  # Analytics calculations
│   │   │   ├── task-service.ts       # Task management
│   │   │   └── ...
│   │   │
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── use-auth.ts           # Authentication hook
│   │   │   ├── use-analytics.ts      # Analytics hook
│   │   │   ├── use-confirm.ts        # Confirmation dialog hook
│   │   │   └── ...
│   │   │
│   │   ├── supabase/                 # Supabase client config
│   │   │   ├── client.ts             # Client-side Supabase
│   │   │   └── server.ts             # Server-side Supabase
│   │   │
│   │   ├── stores/                   # Zustand state stores
│   │   ├── templates/                # AI prompt templates
│   │   └── utils/                    # Helper functions
│   │
│   └── types/                        # TypeScript type definitions
│
├── supabase/                         # Supabase configuration
│   └── migrations/                   # Database migrations
│
├── public/                           # Static assets
│
├── playwright.config.ts              # Playwright test config
├── tsconfig.json                     # TypeScript config
├── tailwind.config.ts                # Tailwind CSS config
├── next.config.ts                    # Next.js config
└── package.json                      # Dependencies

```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ or **Bun**
- **Supabase** account and project
- **Google Generative AI** API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd productivity-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create `.env.local` in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📚 Database Schema

### Key Tables

#### `users`
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `created_at` (Timestamp)
- `theme_preference` (String: light/dark/system)

#### `tasks`
- `id` (UUID, Primary Key)
- `user_id` (UUID, FK to users)
- `title` (String)
- `description` (Text)
- `priority` (String: low/medium/high)
- `quadrant` (String: Q1/Q2/Q3/Q4)
- `status` (String: pending/completed)
- `due_date` (Date)
- `created_at` (Timestamp)

#### `time_blocks`
- `id` (UUID, Primary Key)
- `user_id` (UUID, FK to users)
- `start_time` (Timestamp)
- `end_time` (Timestamp)
- `type` (String: work/break/meeting/personal/exercise/learning)
- `notes` (Text)
- `task_id` (UUID, FK to tasks)
- `is_completed` (Boolean)

#### `analytics_stats`
- `id` (UUID, Primary Key)
- `user_id` (UUID, FK to users)
- `date` (Date)
- `tasks_completed` (Integer)
- `pomodoro_sessions` (Integer)
- `total_time_blocked` (Integer)

#### `reminders`
- `id` (UUID, Primary Key)
- `user_id` (UUID, FK to users)
- `task_id` (UUID, FK to tasks)
- `reminder_type` (String: email/notification/push)
- `scheduled_time` (Timestamp)

---

## 🎯 Key Pages

### Dashboard (`/dashboard`)
- Overview of today's tasks and metrics
- Quick shortcuts to all features
- Real-time statistics

### Tasks (`/eisenhower`)
- Eisenhower Matrix view
- Drag-and-drop task management
- Priority-based organization

### Pomodoro (`/pomodoro`)
- 25-minute focus sessions with 5-minute breaks
- Session tracking and history
- Sound notifications

### Time Blocking (`/time-blocking`)
- Visual calendar view of your day
- Create and manage time blocks
- Link tasks to time blocks

### Analytics (`/analytics`)
- Productivity metrics and charts
- Day/week/month statistics
- Performance trends

### AI Assistant (`/ai`)
- Chat interface with AI
- Task creation assistance
- Productivity recommendations

---

## 🔌 API Integration

### Supabase
- Database queries via JavaScript client
- Real-time subscriptions for live updates
- Authentication and user management
- Storage for files and images

### Google Generative AI (Gemini)
- Chat completions for productivity advice
- Task description generation
- Productivity insights and analysis

### Real-time Features
- Live task updates across browser tabs
- Instant analytics refresh
- Push notifications (when enabled)

---

## 🧪 Testing

Run tests with Playwright:

```bash
# Run all tests
npm run test

# Run with UI
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# Debug mode
npm run test:debug
```

Tests are located in the `tests/` directory.

---

## 🎨 Styling

The app uses **Tailwind CSS v4** with:
- Custom color schemes (light/dark)
- Consistent spacing and typography
- Responsive breakpoints
- Smooth animations via Framer Motion

### Theme Configuration
Located in `tailwind.config.ts` - customize colors, fonts, and spacing here.

---

## 🔐 Authentication

Powered by **Supabase Auth**:
- Email/password authentication
- OAuth providers (Google, GitHub, etc.)
- Magic link sign-in
- Session management
- User profile management

Protected routes require authentication via `useAuth()` hook.

---

## ⚙️ Configuration

### Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI
NEXT_PUBLIC_GEMINI_API_KEY=

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Next.js Config
- Image optimization enabled
- PWA support configured
- ESLint configured
- Turbopack build optimization

---

## 📦 Build & Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Deployment Options
- **Vercel** (Recommended) - Zero-config deployment
- **Docker** - Containerized deployment
- **Traditional hosting** - Node.js server required

---

## 🚀 Performance Tips

1. **Code Splitting** - Automatic via Next.js
2. **Image Optimization** - Use `next/image`
3. **Database Queries** - Use indexes for common filters
4. **Real-time Updates** - Use Supabase subscriptions efficiently
5. **Bundle Size** - Tree-shaking and code splitting enabled

---

## 📝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly with `npm run test`
4. Submit a pull request

---

## 🤝 Support

For issues and feature requests, please open an issue on GitHub or contact the development team.

---

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

---

## 🎉 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Supabase](https://supabase.com/)
- AI powered by [Google Generative AI](https://ai.google.dev/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Icons from [Lucide](https://lucide.dev/)

---

**Happy Productivity! 🚀**
