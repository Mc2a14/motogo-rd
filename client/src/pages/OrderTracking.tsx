import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Loader2, Phone, MessageSquare, CheckCircle, MapPin, X, Star } from "lucide-react";
import { motion } from "framer-motion";
import Map from "@/components/Map";
import { useOrder } from "@/hooks/use-orders";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { api } from "@shared/routes";
import { RatingDialog } from "@/components/RatingDialog";
import { useRatingByOrder } from "@/hooks/use-ratings";

export default function OrderTracking() {
  const [match, params] = useRoute("/track/:id");
  const [, setLocation] = useLocation();
  const { data: order, isLoading } = useOrder(Number(params?.id));
  const { data: rating } = useRatingByOrder(Number(params?.id));
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showRatingDialog, setShowRatingDialog] = useState(false);

  // Mock driver movement simulation
  const [driverPos, setDriverPos] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (order && (order.status === 'accepted' || order.status === 'in_progress')) {
      setDriverPos({ lat: order.pickupLat + 0.005, lng: order.pickupLng + 0.005 });
      
      const interval = setInterval(() => {
        setDriverPos((prev: {lat: number, lng: number} | null) => {
          if (!prev) return null;
          // Slowly move towards pickup or dropoff
          const target = order.status === 'accepted' 
            ? { lat: order.pickupLat, lng: order.pickupLng } 
            : { lat: order.dropoffLat, lng: order.dropoffLng };
          return {
            lat: prev.lat + (target.lat - prev.lat) * 0.05,
            lng: prev.lng + (target.lng - prev.lng) * 0.05
          };
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [order]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!order) {
    return <div className="p-8 text-center">Order not found</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500";
      case "accepted": return "bg-blue-500";
      case "in_progress": return "bg-accent";
      case "completed": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const statusText = t(`status.${order.status}`);

  const handleCancel = async () => {
    if (!order || order.status !== "pending") return;
    
    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to cancel order");
      
      toast({ title: "Order Cancelled", description: "Your order has been cancelled." });
      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.orders.get.path, order.id] });
      setTimeout(() => setLocation("/history"), 1000);
    } catch (error) {
      toast({ title: "Error", description: "Could not cancel order.", variant: "destructive" });
    }
  };

  const canCancel = order.status === "pending" && order.customerId === user?.id;

  return (
    <div className="h-full flex flex-col md:flex-row">
      <div className="flex-1 relative order-2 md:order-1 h-[50vh] md:h-full">
        <Map 
          pickup={{ lat: order.pickupLat, lng: order.pickupLng }}
          dropoff={{ lat: order.dropoffLat, lng: order.dropoffLng }}
          showDrivers={order.status === 'pending'}
          interactive={true}
        />
        {driverPos && (
          <div className="hidden">
            {/* Logic to inject driver marker into Map component if we had ref, 
                for now we'll just ensure the Map component handles showing drivers */}
          </div>
        )}
      </div>

      <div className="flex flex-col md:w-[400px] order-1 md:order-2 bg-card border-l border-border h-auto md:h-full z-20">
        <div className="p-6 md:p-8 space-y-6">
          
          {/* Status Header */}
          <div className="text-center space-y-2">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-2 relative"
            >
              <div className={`absolute inset-0 rounded-full opacity-20 animate-ping ${getStatusColor(order.status)}`} />
              <div className={`w-3 h-3 rounded-full ${getStatusColor(order.status)}`} />
            </motion.div>
            <h2 className="text-2xl font-display font-bold">{statusText}</h2>
            <p className="text-muted-foreground text-sm">Estimated arrival: 5 mins</p>
          </div>

          <Separator />

          {/* Driver Info (if accepted) */}
          {(order.status === 'accepted' || order.status === 'in_progress') && (
            <Card className="p-4 border border-border/50 bg-secondary/20">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 border-2 border-background">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Juan`} />
                  <AvatarFallback>DR</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-bold">Juan Perez</h4>
                  <p className="text-xs text-muted-foreground">Yamaha DT-125 • A123BCD</p>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="outline" className="rounded-full w-10 h-10">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                  <Button size="icon" className="rounded-full w-10 h-10 bg-green-500 hover:bg-green-600 text-white border-none">
                    <Phone className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Trip Details */}
          <div className="space-y-6 pt-4">
             <div className="flex gap-4">
               <div className="flex flex-col items-center">
                 <div className="w-2 h-2 rounded-full bg-blue-500" />
                 <div className="w-0.5 flex-1 bg-border my-1" />
                 <div className="w-2 h-2 rounded-full bg-accent" />
               </div>
               <div className="flex-1 space-y-6">
                 <div>
                   <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Pickup</label>
                   <p className="text-sm font-medium">{order.pickupAddress}</p>
                 </div>
                 <div>
                   <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Dropoff</label>
                   <p className="text-sm font-medium">{order.dropoffAddress}</p>
                 </div>
               </div>
             </div>
          </div>
          
          <Separator />

          <div className="flex justify-between items-center">
             <span className="font-medium text-muted-foreground">Total</span>
             <span className="text-xl font-display font-bold">{t("common.currency")} {order.price}</span>
          </div>

          {order.status === 'completed' && (
             <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-4 rounded-xl flex items-center justify-center gap-2">
               <CheckCircle className="w-5 h-5" />
               <span className="font-bold">Trip Finished</span>
             </div>
          )}

          {canCancel && (
            <Button 
              variant="destructive" 
              className="w-full h-12 rounded-xl"
              onClick={handleCancel}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel Order
            </Button>
         )}
       </div>
     </div>

     {/* Rating Dialog */}
     {order && order.driverId && (
       <RatingDialog
         open={showRatingDialog}
         onOpenChange={setShowRatingDialog}
         orderId={order.id}
         driverId={order.driverId}
         onRated={() => {
           queryClient.invalidateQueries({ queryKey: ["ratings", "order", order.id] });
         }}
       />
     )}
   </div>
 );
}
