import { User, LogOut, Settings, Shield, CreditCard, Bell } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function Profile() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  if (!user) {
    return (
       <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-6">
         <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center">
           <User className="w-10 h-10 text-muted-foreground" />
         </div>
         <div className="space-y-2">
           <h2 className="text-2xl font-bold">{t("auth.login")}</h2>
           <p className="text-muted-foreground max-w-xs mx-auto">Access your history and save your preferences.</p>
         </div>
         <Button className="w-full max-w-sm h-12 rounded-xl text-lg" onClick={() => window.location.href = "/api/login"}>
           Login with Replit
         </Button>
       </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background md:bg-secondary/20">
      <div className="p-6 md:p-10 max-w-2xl mx-auto w-full space-y-8">
        <h1 className="text-3xl font-display font-bold">{t("nav.profile")}</h1>

        {/* User Card */}
        <Card className="p-6 flex items-center gap-6 border-none shadow-lg">
          <Avatar className="w-20 h-20 border-4 border-background shadow-sm">
            <AvatarImage src={user.profileImageUrl || undefined} />
            <AvatarFallback className="text-xl bg-accent text-white font-bold">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{user.firstName} {user.lastName}</h2>
            <p className="text-muted-foreground">{user.email}</p>
            <div className="mt-2 inline-flex items-center px-2 py-1 rounded-md bg-green-100 text-green-700 text-xs font-bold uppercase">
              Member
            </div>
          </div>
        </Card>

        {/* Settings Sections */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider pl-1">{t("common.settings")}</h3>
          
          <Card className="overflow-hidden border-border/50">
            <div className="divide-y divide-border/50">
              <div className="p-4 flex items-center justify-between hover:bg-secondary/50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Privacy & Security</span>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between hover:bg-secondary/50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Payment Methods</span>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600">
                    <Bell className="w-5 h-5" />
                  </div>
                  <span className="font-medium">Notifications</span>
                </div>
                <Switch />
              </div>
            </div>
          </Card>
        </div>

        <Button 
          variant="destructive" 
          className="w-full h-12 rounded-xl"
          onClick={() => logout()}
        >
          <LogOut className="w-4 h-4 mr-2" />
          {t("nav.logout")}
        </Button>

        <p className="text-center text-xs text-muted-foreground">Version 1.0.0 • MotoGo RD</p>
      </div>
    </div>
  );
}
