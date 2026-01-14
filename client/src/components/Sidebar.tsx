import { Link, useLocation } from "wouter";
import { Home, History, User, LogOut, Moon, Sun, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const links = [
    { href: "/", icon: Home, label: t("nav.home") },
    { href: "/history", icon: History, label: t("nav.history") },
    { href: "/profile", icon: User, label: t("nav.profile") },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen border-r border-border bg-card sticky top-0 p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
          <span className="text-white font-display font-bold text-xl">M</span>
        </div>
        <h1 className="font-display font-bold text-2xl tracking-tight">Moto<span className="text-accent">Go</span></h1>
      </div>

      <nav className="flex-1 space-y-2">
        {links.map(({ href, icon: Icon, label }) => (
          <Link 
            key={href} 
            href={href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
              location === href 
                ? "bg-accent text-accent-foreground shadow-lg shadow-accent/25" 
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Icon className="w-5 h-5" />
            {label}
          </Link>
        ))}
      </nav>

      <Separator className="my-6" />

      <div className="space-y-4">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between px-4">
          <span className="text-sm font-medium text-muted-foreground">{t("common.theme")}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
          >
            {theme === "dark" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </Button>
        </div>

        {/* Language Toggle */}
        <div className="flex items-center justify-between px-4">
          <span className="text-sm font-medium text-muted-foreground">{t("common.language")}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === "en" ? "es" : "en")}
            className="font-mono text-xs"
          >
            {language.toUpperCase()}
          </Button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl mt-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
             {/* If user has image, we could use it here */}
             <User className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{user?.firstName || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => logout()}
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
