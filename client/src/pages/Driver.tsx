import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2, MapPin, CheckCircle, X, Navigation, Clock, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import Map from "@/components/Map";
import { useOrders, useUpdateOrder } from "@/hooks/use-orders";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { api } from "@shared/routes";

export default function Driver() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { data: orders, isLoading } = useOrders();
  const { t } = useLanguage();
  const { toast } = useToast();
  const updateOrder = useUpdateOrder();
  const queryClient = useQueryClient();

  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);

  // Filter pending orders (only orders that are truly pending and not assigned to this driver)
  const pendingOrders = orders?.filter(o => 
    o.status === "pending" && o.driverId !== user?.id
  ) || [];
  
  // Active order: only orders assigned to this driver that are not completed or cancelled
  const activeOrder = orders?.find(o => 
    o.driverId === user?.id && 
    o.status !== "completed" &&
    o.status !== "cancelled" &&
    (o.status === "accepted" || o.status === "in_progress")
  );

  // Update driver location periodically (mock for now)
  useEffect(() => {
    if (user?.role !== "driver") return;

    const interval = setInterval(() => {
      // This would use geolocation API in production
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetch("/api/driver/location", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              }),
            }).catch(() => {
              // Silently fail if update doesn't work
            });
          },
          (error) => {
            // Silently handle geolocation errors (permission denied, etc.)
            // This is expected in some browsers/environments
          }
        );
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  const handleAcceptOrder = async (orderId: number) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/accept`, {
        method: "POST",
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to accept order" }));
        throw new Error(errorData.message || "Failed to accept order");
      }
      
      // Invalidate queries to refresh the order list and specific order
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.orders.get.path, orderId] });
      
      toast({ title: "Order Accepted", description: "You have accepted this order." });
      setSelectedOrder(orderId);
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Could not accept order.", 
        variant: "destructive" 
      });
    }
  };

  const handleUpdateStatus = async (orderId: number, status: "in_progress" | "completed") => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to update status" }));
        throw new Error(errorData.message || "Failed to update status");
      }
      
      // Invalidate queries to refresh the order list and specific order
      queryClient.invalidateQueries({ queryKey: [api.orders.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.orders.get.path, orderId] });
      
      toast({ 
        title: status === "in_progress" ? "Trip Started" : "Trip Completed",
        description: `Order status updated to ${status === "in_progress" ? "in progress" : "completed"}.`
      });
      
      // If completed, redirect to history after a short delay
      if (status === "completed") {
        setTimeout(() => setLocation("/history"), 1500);
      }
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Could not update status.", 
        variant: "destructive" 
      });
    }
  };

  if (user?.role !== "driver") {
    return (
      <div className="h-full flex items-center justify-center p-6 text-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Driver Access Only</h2>
          <p className="text-muted-foreground">This page is only available for drivers.</p>
          <Button onClick={() => setLocation("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const orderToDisplay = activeOrder || (selectedOrder && orders?.find(o => o.id === selectedOrder));

  return (
    <div className="h-full flex flex-col md:flex-row">
      {/* Map Section */}
      <div className="flex-1 relative order-2 md:order-1 h-[50vh] md:h-full">
        {orderToDisplay ? (
          <Map
            pickup={{ lat: orderToDisplay.pickupLat, lng: orderToDisplay.pickupLng }}
            dropoff={{ lat: orderToDisplay.dropoffLat, lng: orderToDisplay.dropoffLng }}
            showDrivers={false}
          />
        ) : (
          <Map showDrivers={true} />
        )}
      </div>

      {/* Orders Panel */}
      <div className="flex flex-col md:w-[450px] order-1 md:order-2 bg-card border-l border-border h-auto md:h-full z-20 overflow-y-auto">
        <div className="p-6 space-y-4">
          <div>
            <h1 className="text-2xl font-display font-bold mb-2">Driver Dashboard</h1>
            <Badge variant={user?.isOnline ? "default" : "secondary"}>
              {user?.isOnline ? "Online" : "Offline"}
            </Badge>
          </div>

          {/* Active Order */}
          {activeOrder && (
            <Card className="p-4 border-2 border-accent bg-accent/5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg">Active Order</h3>
                <Badge variant="default">{t(`status.${activeOrder.status}`)}</Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <div className="w-0.5 flex-1 bg-border my-1" />
                    <div className="w-3 h-3 rounded-full bg-accent" />
                  </div>
                  <div className="flex-1 space-y-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase mb-1">Pickup</p>
                      <p className="font-medium">{activeOrder.pickupAddress}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase mb-1">Dropoff</p>
                      <p className="font-medium">{activeOrder.dropoffAddress}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-xl font-bold">{t("common.currency")} {activeOrder.price}</span>
                </div>

                <div className="flex gap-2 pt-2">
                  {activeOrder.status === "accepted" && (
                    <Button
                      className="flex-1"
                      onClick={() => handleUpdateStatus(activeOrder.id, "in_progress")}
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Start Trip
                    </Button>
                  )}
                  {activeOrder.status === "in_progress" && (
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleUpdateStatus(activeOrder.id, "completed")}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Trip
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Pending Orders */}
          {!activeOrder && (
            <>
              <h2 className="text-lg font-bold mt-4">Available Orders ({pendingOrders.length})</h2>
              
              {pendingOrders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No pending orders</p>
                  <p className="text-sm mt-2">Wait for new orders to appear</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingOrders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-border/50"
                        onClick={() => setSelectedOrder(order.id)}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="capitalize">
                              {t(`service.${order.type}`)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(order.createdAt || ""), "h:mm a")}
                            </span>
                          </div>

                          <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                              <p className="text-xs">{order.pickupAddress}</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                              <p className="text-xs">{order.dropoffAddress}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <span className="text-lg font-bold">{t("common.currency")} {order.price}</span>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAcceptOrder(order.id);
                              }}
                            >
                              Accept
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}



