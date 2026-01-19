import { useState } from "react";
import { useLocation } from "wouter";
import { Search, MapPin, Bike, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Map from "@/components/Map";
import { ServiceCard, type ServiceType } from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [address, setAddress] = useState("");

  const handleBooking = () => {
    if (selectedService) {
      setLocation(`/booking/${selectedService}?address=${encodeURIComponent(address)}`);
    }
  };

  // Show driver dashboard prompt for drivers
  if (user?.role === "driver") {
    return (
      <div className="h-full flex flex-col md:flex-row relative">
        {/* Map Background */}
        <div className="absolute inset-0 md:relative md:flex-1 md:order-2 z-0">
          <Map showDrivers={true} />
        </div>

        {/* Driver Content */}
        <div className="relative md:static z-10 flex flex-col justify-center h-full md:w-[450px] md:h-auto md:min-h-screen bg-transparent md:bg-card md:border-r border-border p-4 md:p-8">
          <Card className="bg-card/95 backdrop-blur-xl md:bg-transparent rounded-3xl p-8 md:p-0 shadow-2xl md:shadow-none border border-border/50 md:border-none space-y-6">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                <Bike className="w-10 h-10 text-accent" />
              </div>
              <h2 className="text-3xl font-display font-bold">{t("home.driver_welcome")}</h2>
              <p className="text-muted-foreground">{t("home.driver_description")}</p>
            </div>

            <Button
              className="w-full h-14 text-lg font-semibold rounded-xl shadow-lg shadow-accent/25"
              size="lg"
              onClick={() => setLocation("/driver")}
            >
              {t("home.go_to_dashboard")}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                {t("home.driver_hint")}
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col md:flex-row relative">
      {/* Map Background (Mobile) / Side (Desktop) */}
      <div className="absolute inset-0 md:relative md:flex-1 md:order-2 z-0">
        <Map showDrivers={true} />
        {/* Gradient Overlay for Mobile */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background via-background/80 to-transparent md:hidden pointer-events-none" />
      </div>

      {/* Content Overlay */}
      <div className="relative md:static z-10 flex flex-col justify-end md:justify-start h-full md:w-[450px] md:h-auto md:min-h-screen bg-transparent md:bg-card md:border-r border-border p-4 md:p-8 pointer-events-none md:pointer-events-auto">
        <div className="bg-card/95 backdrop-blur-xl md:bg-transparent rounded-3xl p-6 md:p-0 shadow-2xl md:shadow-none pointer-events-auto space-y-6 border border-border/50 md:border-none">
          
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-bold">{t("home.greeting")}</h2>
            
            <div className="relative group">
              <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
              <Input 
                placeholder={t("home.search_placeholder")} 
                className="pl-10 h-12 rounded-xl bg-secondary/50 border-transparent focus:bg-background focus:border-accent shadow-sm"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(["ride", "food", "document", "errand"] as ServiceType[]).map((type) => (
              <ServiceCard 
                key={type}
                type={type}
                selected={selectedService === type}
                onClick={() => setSelectedService(type)}
              />
            ))}
          </div>

          <Button 
            className="w-full h-12 text-lg font-semibold rounded-xl shadow-lg shadow-primary/25 disabled:shadow-none disabled:opacity-50"
            size="lg"
            disabled={!selectedService}
            onClick={handleBooking}
          >
            {selectedService ? t("common.back") + " ->" : "Select a service"}
          </Button>
        </div>
      </div>
    </div>
  );
}
