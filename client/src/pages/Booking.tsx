import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, MapPin, Navigation, Clock, CreditCard } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import Map from "@/components/Map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/hooks/use-language";
import { useCreateOrder } from "@/hooks/use-orders";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

// Initial center for demo (Santo Domingo)
const INITIAL_CENTER = { lat: 18.4861, lng: -69.9312 };

export default function Booking() {
  const [match, params] = useRoute("/booking/:type");
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const createOrder = useCreateOrder();
  
  const type = params?.type || "ride";
  const searchParams = new URLSearchParams(window.location.search);
  const initialAddress = searchParams.get("address") || "";

  const [pickupAddr, setPickupAddr] = useState(initialAddress);
  const [dropoffAddr, setDropoffAddr] = useState("");
  const [notes, setNotes] = useState("");
  
  // Simulation of coordinate selection (center of map)
  const [pickupCoords, setPickupCoords] = useState(INITIAL_CENTER);
  const [dropoffCoords, setDropoffCoords] = useState({ lat: 18.4900, lng: -69.9400 });

  // Pricing Logic (Mock)
  const basePrice = type === 'ride' ? 150 : 200;
  const distance = 5.2; // mock km
  const time = 15; // mock mins
  const price = basePrice + Math.round(distance * 20); // Add simulated distance cost

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Please login", description: "You need to be logged in to book.", variant: "destructive" });
      return;
    }

    try {
      const order = await createOrder.mutateAsync({
        customerId: user.id as string,
        type: type as any,
        pickupAddress: pickupAddr || "Av. Winston Churchill",
        pickupLat: pickupCoords.lat,
        pickupLng: pickupCoords.lng,
        dropoffAddress: dropoffAddr || "Zona Colonial, Santo Domingo",
        dropoffLat: dropoffCoords.lat,
        dropoffLng: dropoffCoords.lng,
        price,
        description: notes,
      });
      
      toast({ title: "Order Created!", description: "Searching for a driver..." });
      setLocation(`/track/${order.id}`);
    } catch (error) {
      toast({ title: "Error", description: "Could not create order.", variant: "destructive" });
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row">
      <div className="flex-1 relative order-2 md:order-1 h-[40vh] md:h-full">
        <Map 
          pickup={pickupCoords} 
          dropoff={dropoffCoords}
        />
        {/* Mobile Back Button */}
        <Button 
          variant="outline" 
          size="icon" 
          className="absolute top-4 left-4 z-[400] md:hidden bg-background/80 backdrop-blur-md rounded-full"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex flex-col h-[60vh] md:h-auto md:w-[450px] md:order-2 bg-card border-l border-border shadow-2xl z-20">
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden md:flex -ml-2 rounded-full"
              onClick={() => setLocation("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-display font-bold capitalize">{t(`service.${type}`)}</h1>
          </div>

          <div className="space-y-6">
            {/* Locations */}
            <div className="relative space-y-4">
              {/* Connector Line */}
              <div className="absolute left-[19px] top-10 bottom-10 w-0.5 bg-border -z-10" />

              <div className="flex gap-3">
                <div className="mt-3 w-4 h-4 rounded-full bg-blue-500 ring-4 ring-blue-500/20 shrink-0" />
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">{t("booking.pickup")}</label>
                  <Input 
                    value={pickupAddr} 
                    onChange={(e) => setPickupAddr(e.target.value)}
                    placeholder="Enter pickup location"
                    className="bg-secondary/30"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-3 w-4 h-4 rounded-full bg-accent ring-4 ring-accent/20 shrink-0" />
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">{t("booking.dropoff")}</label>
                  <Input 
                    value={dropoffAddr} 
                    onChange={(e) => setDropoffAddr(e.target.value)}
                    placeholder="Enter destination"
                    className="bg-secondary/30"
                  />
                </div>
              </div>
            </div>

            {/* Optional Details */}
            <div className="space-y-2">
               <label className="text-xs font-semibold text-muted-foreground uppercase">{t("booking.details")}</label>
               <Textarea 
                 value={notes} 
                 onChange={(e) => setNotes(e.target.value)} 
                 placeholder="Apartment number, instructions, or item details..."
                 className="resize-none bg-secondary/30 min-h-[80px]"
               />
            </div>

            {/* Price Estimate Card */}
            <Card className="p-4 bg-secondary/20 border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">{t("booking.price")}</span>
                <span className="text-2xl font-display font-bold">{t("common.currency")} {price}</span>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Navigation className="w-3 h-3" /> 5.2 km
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 15 min
                </div>
                <div className="flex items-center gap-1">
                  <CreditCard className="w-3 h-3" /> Cash
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="p-6 border-t border-border bg-card">
          <Button 
            className="w-full h-14 text-lg font-bold rounded-xl shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/40 transition-all"
            size="lg"
            onClick={handleSubmit}
            disabled={createOrder.isPending}
          >
            {createOrder.isPending ? t("booking.creating") : t("booking.confirm")}
          </Button>
        </div>
      </div>
    </div>
  );
}
