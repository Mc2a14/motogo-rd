import { useLocation, Link } from "wouter";
import { Home, History, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";

export function BottomNav() {
  const [location] = useLocation();
  const { t } = useLanguage();

  const links = [
    { href: "/", icon: Home, label: t("nav.home") },
    { href: "/history", icon: History, label: t("nav.history") },
    { href: "/profile", icon: User, label: t("nav.profile") },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border py-2 px-6 pb-6 md:pb-2 z-50 flex justify-around items-center md:hidden shadow-lg">
      {links.map(({ href, icon: Icon, label }) => {
        const isActive = location === href;
        return (
          <Link 
            key={href} 
            href={href}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
              isActive ? "text-accent" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className={cn("w-6 h-6", isActive && "fill-current/20")} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </div>
  );
}
