import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LogIn, FileText, Layout, Zap, ArrowRight, Loader2 } from "lucide-react";

export default function Landing() {
  const { isAuthenticated, isLoading, login, register } = useAuth();
  const [, setLocation] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (isLoading) return null;
  if (isAuthenticated) return <Redirect to="/app" />;

  const openDialog = (m: "login" | "register") => {
    setMode(m);
    setUsername("");
    setPassword("");
    login.reset();
    register.reset();
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mutation = mode === "login" ? login : register;
    mutation.mutate(
      { username: username.trim(), password },
      { onSuccess: () => { setDialogOpen(false); setLocation("/app"); } }
    );
  };

  const isPending = login.isPending || register.isPending;
  const error = login.error?.message ?? register.error?.message ?? null;

  return (
    <>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {mode === "login" ? "Welcome back" : "Create an account"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="yourname"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder={mode === "register" ? "At least 6 characters" : "••••••••"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive font-medium">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mode === "login" ? "Log in" : "Create account"}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              {mode === "login" ? (
                <>
                  No account?{" "}
                  <button
                    type="button"
                    className="text-foreground underline underline-offset-2 hover:opacity-75"
                    onClick={() => { setMode("register"); login.reset(); }}
                  >
                    Register
                  </button>
                </>
              ) : (
                <>
                  Already registered?{" "}
                  <button
                    type="button"
                    className="text-foreground underline underline-offset-2 hover:opacity-75"
                    onClick={() => { setMode("login"); register.reset(); }}
                  >
                    Log in
                  </button>
                </>
              )}
            </p>
          </form>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-background selection:bg-primary/10">
        <nav className="border-b border-border/50 bg-background/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
              <div className="w-8 h-8 bg-foreground text-background rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              Lusk
            </div>
            <Button
              onClick={() => openDialog("login")}
              variant="outline"
              className="hover:bg-accent border-border font-medium"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Log in
            </Button>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 pt-24 pb-32">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-8 border border-border">
              <SparklesIcon className="w-4 h-4 text-purple-500" />
              Now with AI features
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-8 text-balance text-foreground">
              Your workspace,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground">
                perfectly organized.
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
              Write, plan, collaborate, and get organized. All your work in one unified workspace that adapts to your needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => openDialog("register")}
                className="w-full sm:w-auto h-14 px-8 text-lg font-medium hover:-translate-y-0.5 transition-transform shadow-lg shadow-black/5"
              >
                Get started for free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-24">
            <FeatureCard
              icon={<FileText className="w-6 h-6 text-blue-500" />}
              title="Block-based Editor"
              description="Build your documents block by block. Rearrange, transform, and style with a simple slash command."
            />
            <FeatureCard
              icon={<Layout className="w-6 h-6 text-amber-500" />}
              title="Powerful Databases"
              description="More than just a table. Organize data with tags, status, and custom properties."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-purple-500" />}
              title="AI Assisted"
              description="Writer's block? Ask AI to generate content, summarize, or rewrite directly in your document."
            />
          </div>

          <div className="mt-32 rounded-2xl border border-border/50 bg-card shadow-2xl overflow-hidden aspect-video relative flex items-center justify-center bg-gradient-to-br from-background to-muted">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            <div className="z-10 w-3/4 h-3/4 bg-background/80 backdrop-blur-xl border border-border rounded-xl shadow-xl flex">
              <div className="w-1/4 border-r border-border p-4 hidden md:block">
                <div className="h-4 w-20 bg-muted rounded mb-6" />
                <div className="space-y-3">
                  <div className="h-3 w-full bg-muted rounded" />
                  <div className="h-3 w-5/6 bg-muted rounded" />
                  <div className="h-3 w-4/6 bg-muted rounded" />
                </div>
              </div>
              <div className="flex-1 p-8">
                <div className="h-8 w-1/3 bg-muted rounded mb-8" />
                <div className="space-y-4">
                  <div className="h-4 w-full bg-muted rounded" />
                  <div className="h-4 w-full bg-muted rounded" />
                  <div className="h-4 w-3/4 bg-muted rounded" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
