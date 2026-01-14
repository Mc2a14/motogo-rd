import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import { LanguageProvider } from "@/hooks/use-language";
import NotFound from "@/pages/not-found";

// Components
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";

// Pages
import Home from "@/pages/Home";
import Booking from "@/pages/Booking";
import OrderTracking from "@/pages/OrderTracking";
import History from "@/pages/History";
import Profile from "@/pages/Profile";

function Router() {
  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      <Sidebar />
      <main className="flex-1 relative h-full overflow-hidden flex flex-col pb-16 md:pb-0">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/booking/:type" component={Booking} />
          <Route path="/track/:id" component={OrderTracking} />
          <Route path="/history" component={History} />
          <Route path="/profile" component={Profile} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <BottomNav />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="motogo-theme">
        <LanguageProvider>
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
