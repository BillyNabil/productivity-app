# 📘 Quick Reference Guide

A quick reference for developers working on the productivity app.

---

## 🏃 Quick Start (30 seconds)

```bash
# 1. Install
npm install

# 2. Setup env
# Copy .env.local.example to .env.local
# Add Supabase and Gemini API keys

# 3. Run
npm run dev

# 4. Open browser
# http://localhost:3000
```

---

## 📁 Common File Locations

| What | Where |
|------|-------|
| **Pages** | `src/app/[feature]/page.tsx` |
| **Components** | `src/components/[feature]/` |
| **Hooks** | `src/lib/hooks/use-*.ts` |
| **Services** | `src/lib/services/*-service.ts` |
| **Types** | `src/types/` |
| **Styles** | `src/app/globals.css` (Tailwind) |
| **Config** | Root directory (`*.config.ts`) |
| **Tests** | `tests/` and `tests/e2e/` |

---

## 🚀 Key Commands

```bash
# Development
npm run dev           # Start dev server

# Building
npm run build         # Production build
npm start            # Run production build

# Testing
npm run test         # Run all tests
npm run test:ui      # Playwright UI mode
npm run test:headed  # Run tests with browser visible
npm run test:debug   # Debug mode

# Code Quality
npm run lint         # Run ESLint
npm run lint --fix   # Auto-fix issues
```

---

## 🏗️ Architecture Overview

### Layers

```
UI Layer (Components)
    ↓
State Management Layer (Zustand + Hooks)
    ↓
Services Layer (Business Logic)
    ↓
Data Layer (Supabase)
```

### Data Flow

1. **User Interaction** → React Component
2. **Component** → Custom Hook (`use-*.ts`)
3. **Hook** → Service (`*-service.ts`)
4. **Service** → Supabase Client
5. **Supabase** → PostgreSQL Database
6. **Response** → Zustand Store → Component Update

---

## 🎯 Common Tasks

### Adding a New Page

1. Create `src/app/feature/page.tsx`
2. Add route to navigation in `src/components/layout/header.tsx`
3. Create component in `src/components/feature/`
4. Add to Supabase if data is needed

### Adding a New Feature

1. Create service: `src/lib/services/feature-service.ts`
2. Create hook: `src/lib/hooks/use-feature.ts`
3. Create component: `src/components/feature/feature-component.tsx`
4. Create type: `src/types/feature.ts`
5. Add to relevant page

### Database Query

```typescript
// In service
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('user_id', userId);
```

### Real-time Subscription

```typescript
// Listen for changes
const channel = supabase
  .channel('table_name')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'table_name' },
    (payload) => {
      // Handle changes
    }
  )
  .subscribe();

// Cleanup
supabase.removeChannel(channel);
```

### AI Integration

```typescript
// In ai-service.ts
const message = await this.generateResponse(userInput);
// Uses Google Generative AI (Gemini)
```

---

## 🔧 Environment Variables

Essential `.env.local` variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## 🎨 Styling Guide

### Tailwind Classes

```tsx
// Color scheme (light/dark mode)
className="bg-white dark:bg-black text-black dark:text-white"

// Common spacing
p-2 p-4 p-6 p-8  // padding
m-2 m-4 m-6 m-8  // margin

// Responsive
md:grid-cols-2 lg:grid-cols-3  // responsive grids

// Flex layouts
flex justify-center items-center gap-4
```

### Dark Mode

Automatically handled by next.js:
- Light mode: Light backgrounds, dark text
- Dark mode: Dark backgrounds, light text
- Use `dark:` prefix for dark mode styles

---

## 🔐 Authentication

### Check if User is Logged In

```typescript
import { useAuth } from '@/lib/hooks/use-auth';

const { user, loading } = useAuth();

if (loading) return <LoadingSpinner />;
if (!user) return <Redirect to="/login" />;
```

### Protected Routes

Already set up in app with middleware. Check `src/lib/hooks/use-auth.ts`

---

## 🧪 Testing

### Run Tests

```bash
npm run test              # All tests
npm run test:ui          # Interactive UI
npm run test -- feature  # Specific feature
```

### Write Tests

Tests use Playwright and are in `tests/` directory.

---

## 📊 Database Tables Reference

### Quick Lookup

- **users** - User accounts and preferences
- **tasks** - Task items and management
- **time_blocks** - Time blocking calendar
- **analytics_stats** - Productivity metrics
- **reminders** - Task reminders
- **habits** - Habit tracking
- **goals** - Daily/long-term goals

See full schema in `README.md`

---

## 🐛 Debugging

### Browser DevTools

1. Press `F12` or `Ctrl+Shift+I`
2. Check Console for errors
3. Use React DevTools for state inspection
4. Use Network tab for API calls

### Server Logs

```bash
# Terminal shows dev server logs
# Look for [next] prefixed messages
```

### Database Debugging

Visit Supabase dashboard:
- View tables directly
- Check RLS policies
- Monitor real-time changes

---

## 📚 Learn More

- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev
- **Tailwind**: https://tailwindcss.com/docs
- **Supabase**: https://supabase.com/docs
- **Gemini API**: https://ai.google.dev/docs

---

## 💡 Pro Tips

1. **Use Components** - Reuse UI components from `src/components/ui/`
2. **Type Everything** - Use TypeScript types for safety
3. **Real-time Data** - Use Supabase subscriptions for live updates
4. **Error Handling** - Always wrap API calls in try-catch
5. **Optimize Queries** - Use `.select()` to only fetch needed fields
6. **Test Before Deploy** - Run full test suite before pushing

---

## 🚀 Ready to Code?

1. Start the dev server: `npm run dev`
2. Open http://localhost:3000
3. Pick a task from the issues
4. Create a feature branch
5. Make your changes
6. Run tests: `npm run test`
7. Submit a PR

Happy coding! 🎉
