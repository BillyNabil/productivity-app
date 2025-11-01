'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/use-auth';
import { LogOut, User, CheckSquare, Menu, X, BarChart3, Zap, Lightbulb } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="border-b bg-black/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-center relative">
          {/* Logo on the left */}
          <div className="absolute left-0">
            <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 text-xl font-bold text-white hover:opacity-80 transition-opacity">
              <CheckSquare className="w-6 h-6" />
            </Link>
          </div>

          {/* Centered Navigation */}
          {user && (
            <>
              {/* Desktop nav - centered */}
              <nav className="hidden md:flex items-center gap-1">
                <Link href="/dashboard">
                  <Button
                    variant={isActive('/dashboard') ? 'secondary' : 'ghost'}
                    className="font-medium"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Link href="/eisenhower">
                  <Button
                    variant={isActive('/eisenhower') ? 'secondary' : 'ghost'}
                    className="font-medium"
                  >
                    Tasks
                  </Button>
                </Link>
                <Link href="/pomodoro">
                  <Button
                    variant={isActive('/pomodoro') ? 'secondary' : 'ghost'}
                    className="font-medium"
                  >
                    Pomodoro
                  </Button>
                </Link>
                <Link href="/time-blocking">
                  <Button
                    variant={isActive('/time-blocking') ? 'secondary' : 'ghost'}
                    className="font-medium"
                  >
                    Calendar
                  </Button>
                </Link>
                <Link href="/analytics">
                  <Button
                    variant={isActive('/analytics') ? 'secondary' : 'ghost'}
                    className="font-medium"
                  >
                    Analytics
                  </Button>
                </Link>
                <Link href="/ai">
                  <Button
                    variant={isActive('/ai') ? 'secondary' : 'ghost'}
                    className="font-medium"
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    AI
                  </Button>
                </Link>
              </nav>
            </>
          )}

          {/* Right side - logout and mobile menu */}
          <div className="absolute right-0 flex items-center gap-2">
            {user && (
              <>
                {/* Desktop logout button */}
                <div className="hidden md:flex">
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    size="icon"
                    title="Sign out"
                    className="text-gray-300 hover:text-white hover:bg-white/10"
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </div>

                {/* Mobile hamburger */}
                <div className="md:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileOpen((s) => !s)}
                    aria-expanded={mobileOpen}
                    aria-label="Toggle menu"
                  >
                    {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </Button>
                </div>
              </>
            )}
            {!user ? (
              <>
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button>Get Started</Button>
                </Link>
              </>
            ) : null}
          </div>
        </div>

        {/* Mobile stacked nav (visible when hamburger opens) */}
        {user && mobileOpen && (
          <div className="md:hidden mt-2 pb-4 border-t border-white/10">
            <nav className="flex flex-col gap-1 pt-4">
              <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                <Button variant={isActive('/dashboard') ? 'secondary' : 'ghost'} className="w-full justify-start font-medium">
                  Dashboard
                </Button>
              </Link>
              <Link href="/eisenhower" onClick={() => setMobileOpen(false)}>
                <Button variant={isActive('/eisenhower') ? 'secondary' : 'ghost'} className="w-full justify-start font-medium">
                  Tasks
                </Button>
              </Link>
              <Link href="/pomodoro" onClick={() => setMobileOpen(false)}>
                <Button variant={isActive('/pomodoro') ? 'secondary' : 'ghost'} className="w-full justify-start font-medium">
                  Pomodoro
                </Button>
              </Link>
              <Link href="/time-blocking" onClick={() => setMobileOpen(false)}>
                <Button variant={isActive('/time-blocking') ? 'secondary' : 'ghost'} className="w-full justify-start font-medium">
                  Calendar
                </Button>
              </Link>
              <Link href="/analytics" onClick={() => setMobileOpen(false)}>
                <Button variant={isActive('/analytics') ? 'secondary' : 'ghost'} className="w-full justify-start font-medium">
                  Analytics
                </Button>
              </Link>
              <Link href="/ai" onClick={() => setMobileOpen(false)}>
                <Button variant={isActive('/ai') ? 'secondary' : 'ghost'} className="w-full justify-start font-medium">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  AI Assistant
                </Button>
              </Link>
              
              {/* Mobile user section */}
              <div className="border-t border-white/10 pt-3 mt-3">
                <div className="flex items-center gap-2 px-3 py-3 mb-2 rounded-lg bg-white/5">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-purple-500">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{user.email?.split('@')[0]}</div>
                    <div className="text-xs text-white/50 truncate">{user.email}</div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-white hover:bg-white/10 transition-colors"
                  disabled
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleSignOut} 
                  className="w-full justify-start text-red-400 hover:bg-red-400/10 hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}


