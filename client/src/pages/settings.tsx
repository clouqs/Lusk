import { useTheme } from "next-themes";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import {
  Sun, Moon, Monitor, User, Palette, Type, Info, LogOut,
} from "lucide-react";

type Theme = "light" | "dark" | "system";

function ThemeOption({
  value,
  current,
  icon,
  label,
  onChange,
}: {
  value: Theme;
  current: string | undefined;
  icon: React.ReactNode;
  label: string;
  onChange: (t: Theme) => void;
}) {
  const isActive = current === value;
  return (
    <button
      onClick={() => onChange(value)}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all w-28 ${
        isActive
          ? "border-primary bg-primary/5 text-primary"
          : "border-border hover:border-muted-foreground/40 text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <div>{children}</div>
    </div>
  );
}

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-10">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your workspace preferences and account.
          </p>
        </div>

        <Separator />

        {/* Appearance */}
        <Section title="Appearance">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Choose how the interface looks. Selecting System will follow your OS preference.
            </p>
            <div className="flex items-center gap-3">
              <ThemeOption
                value="light"
                current={theme}
                icon={<Sun className="w-5 h-5" />}
                label="Light"
                onChange={setTheme}
              />
              <ThemeOption
                value="dark"
                current={theme}
                icon={<Moon className="w-5 h-5" />}
                label="Dark"
                onChange={setTheme}
              />
              <ThemeOption
                value="system"
                current={theme}
                icon={<Monitor className="w-5 h-5" />}
                label="System"
                onChange={setTheme}
              />
            </div>
          </div>
        </Section>

        <Separator />

        {/* Editor */}
        <Section title="Editor">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
              <Palette className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Syntax highlighting</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Code blocks render with syntax highlighting for 30+ languages.
                </p>
              </div>
              <span className="ml-auto text-xs bg-primary/10 text-primary rounded px-2 py-0.5 font-medium">On</span>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
              <Type className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">LaTeX math equations</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Use <code className="bg-muted px-1 rounded text-xs">/math</code> in the editor to insert a KaTeX equation block.
                </p>
              </div>
              <span className="ml-auto text-xs bg-primary/10 text-primary rounded px-2 py-0.5 font-medium">On</span>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
              <Info className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Auto-save</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Pages are automatically saved 1 second after you stop typing.
                </p>
              </div>
              <span className="ml-auto text-xs bg-primary/10 text-primary rounded px-2 py-0.5 font-medium">On</span>
            </div>
          </div>
        </Section>

        <Separator />

        {/* Keyboard shortcuts */}
        <Section title="Keyboard Shortcuts">
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Action</th>
                  <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Shortcut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  ["Bold", "Ctrl + B"],
                  ["Italic", "Ctrl + I"],
                  ["Underline", "Ctrl + U"],
                  ["Strike", "Ctrl + Shift + X"],
                  ["Inline code", "Ctrl + E"],
                  ["Open command menu", "/"],
                  ["Submit math equation", "Shift + Enter"],
                ].map(([action, shortcut]) => (
                  <tr key={action} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 text-foreground">{action}</td>
                    <td className="px-4 py-2.5">
                      <kbd className="bg-muted border border-border rounded px-1.5 py-0.5 text-xs font-mono">
                        {shortcut}
                      </kbd>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Separator />

        {/* Account */}
        <Section title="Account">
          <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
              {user?.firstName?.charAt(0) || user?.email?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout()}
              className="flex-shrink-0 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60 hover:bg-destructive/5"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </Section>

        <Separator />

        {/* About */}
        <Section title="About">
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Notion Clone — AI-powered note-taking workspace.</p>
            <p>Built with TipTap, KaTeX, React, and TailwindCSS.</p>
          </div>
        </Section>
      </div>
    </AppLayout>
  );
}
