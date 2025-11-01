import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, Clock, Calendar, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
            Your Productivity Hub
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-muted-foreground">
            Master your time with intelligent task management, focused work sessions, and strategic planning
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 shadow-lg hover:shadow-xl transition-shadow">
                Get Started Free
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Tasks Card */}
          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 bg-white dark:bg-black backdrop-blur">
            <div className="w-12 h-12 bg-white dark:bg-black rounded-2xl flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-semibold mb-3">
              Smart Task Management
            </h2>
            <p className="mb-6">
              Prioritize with the Eisenhower Matrix. Focus on what matters most.
            </p>
            <Link href="/eisenhower">
              <Button variant="outline" className="w-full group">
                Explore Tasks
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Button>
            </Link>
          </Card>

          {/* Pomodoro Card */}
          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 bg-white dark:bg-black backdrop-blur">
            <div className="w-12 h-12 bg-white dark:bg-black rounded-2xl flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-semibold mb-3">
              Pomodoro Timer
            </h2>
            <p className="mb-6">
              Work in focused 25-minute sprints. Maximize productivity and minimize burnout.
            </p>
            <Link href="/pomodoro">
              <Button variant="outline" className="w-full group">
                Start Timer
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Button>
            </Link>
          </Card>

          {/* Calendar Card */}
          <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 bg-white dark:bg-black backdrop-blur">
            <div className="w-12 h-12 bg-white dark:bg-black rounded-2xl flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-semibold mb-3">
              Time Blocking
            </h2>
            <p className="mb-6">
              Schedule your day strategically. Visualize and control your time.
            </p>
            <Link href="/time-blocking">
              <Button variant="outline" className="w-full group">
                View Calendar
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card backdrop-blur rounded-xl p-6 shadow-md border border-border">
              <div className="text-3xl font-bold mb-2 text-foreground">0</div>
              <div className="text-sm font-medium text-muted-foreground">Tasks Completed</div>
            </div>
            <div className="bg-card backdrop-blur rounded-xl p-6 shadow-md border border-border">
              <div className="text-3xl font-bold mb-2 text-foreground">0</div>
              <div className="text-sm font-medium text-muted-foreground">Pomodoros</div>
            </div>
            <div className="bg-card backdrop-blur rounded-xl p-6 shadow-md border border-border">
              <div className="text-3xl font-bold mb-2 text-foreground">0h</div>
              <div className="text-sm font-medium text-muted-foreground">Focus Time</div>
            </div>
            <div className="bg-card backdrop-blur rounded-xl p-6 shadow-md border border-border">
              <div className="text-3xl font-bold mb-2 text-foreground">0</div>
              <div className="text-sm font-medium text-muted-foreground">Time Blocks</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 mb-12">
        <div className="max-w-4xl mx-auto bg-primary rounded-2xl shadow-2xl p-8 md:p-12">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-primary-foreground">
            Ready to Transform Your Productivity?
          </h2>
          <p className="text-xl text-center mb-8 max-w-2xl mx-auto text-primary-foreground/90">
            Join thousands of productive people who achieve more with less stress
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="text-lg px-8 shadow-lg hover:shadow-xl transition-shadow">
                Create Free Account
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="text-lg px-8">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


