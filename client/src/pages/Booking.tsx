import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { ArrowLeft, MapPin, Navigation, Clock, CreditCard, Loader2 } from "lucide-react";
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
import { getCurrentLocation, geocodeAddress, reverseGeocode } from "@/lib/geocoding";
import { calculatePricing, type PricingBreakdown } from "@/lib/pricing";

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
  
  // Coordinate states
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isGeocodingPickup, setIsGeocodingPickup] = useState(false);
  const [isGeocodingDropoff, setIsGeocodingDropoff] = useState(false);
  
  // Map selection mode: 'pickup', 'dropoff', or null
  const [selectionMode, setSelectionMode] = useState<'pickup' | 'dropoff' | null>(null);
  
  // Pricing breakdown
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);

  // Check Google Maps API key status on mount
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (apiKey) {
      console.log('✅ Google Maps API Key is configured');
      console.log('📍 API Key length:', apiKey.length);
    } else {
      console.error('❌ Google Maps API Key is NOT configured!');
      console.error('⚠️ Distance calculations will be inaccurate (using straight-line distance)');
      console.error('⚠️ To fix: Add VITE_GOOGLE_MAPS_API_KEY to Railway environment variables');
    }
  }, []);

  // Get user's current location on mount - always try to get location when page opens
  useEffect(() => {
    // Always try to get current location when booking page opens
    // If there's an initialAddress from URL, we'll still try location first, then fall back to it
    if (!pickupCoords) {
      setIsLoadingLocation(true);
      getCurrentLocation()
        .then((coords) => {
          setPickupCoords(coords);
          // Reverse geocode to get address
          reverseGeocode(coords.lat, coords.lng)
            .then((address) => {
              setPickupAddr(address);
            })
            .catch(() => {
              // If reverse geocoding fails, use coordinates as fallback
              setPickupAddr(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
            });
        })
        .catch((error) => {
          console.error('❌ Failed to get current location:', error.message);
          
          // Show user-friendly message about location
          if (error.message.includes('permission') || error.message.includes('denied')) {
            toast({
              title: "Location Permission Required",
              description: "Please enable location access in your browser settings. Click the lock icon (🔒) in the address bar → Site settings → Location → Allow",
              variant: "destructive",
              duration: 8000,
            });
          } else if (error.message.includes('unavailable') || error.message.includes('not available')) {
            toast({
              title: "Location Not Available",
              description: "Your device can't determine location. Please select your location on the map or enter it manually.",
              variant: "default",
              duration: 5000,
            });
          } else if (error.message.includes('accuracy')) {
            toast({
              title: "Location Too Inaccurate",
              description: error.message,
              variant: "default",
              duration: 5000,
            });
          }
          
          // If location fails and we have initialAddress from URL, use that
          if (initialAddress) {
            setPickupAddr(initialAddress);
            // Geocode the initial address
            geocodeAddress(initialAddress)
              .then((result) => {
                setPickupCoords({ lat: result.lat, lng: result.lng });
                setPickupAddr(result.address);
              })
              .catch(() => {
                // Final fallback to default location
                console.warn('⚠️ Using default location (Santo Domingo) as fallback');
                setPickupCoords(INITIAL_CENTER);
                setPickupAddr("Santo Domingo, Dominican Republic");
              });
          } else {
            // No initial address, use default location
            console.warn('⚠️ Using default location (Santo Domingo) as fallback');
            setPickupCoords(INITIAL_CENTER);
            setPickupAddr("Santo Domingo, Dominican Republic");
          }
        })
        .finally(() => {
          setIsLoadingLocation(false);
        });
    } else if (pickupAddr && !pickupCoords) {
      // If we have an address but no coordinates, geocode it
      setIsGeocodingPickup(true);
      geocodeAddress(pickupAddr)
        .then((result) => {
          setPickupCoords({ lat: result.lat, lng: result.lng });
          setPickupAddr(result.address);
        })
        .catch((error) => {
          console.error('Geocoding error:', error);
          // Fallback to default location
          setPickupCoords(INITIAL_CENTER);
        })
        .finally(() => {
          setIsGeocodingPickup(false);
        });
    }
  }, []);

  // Geocode pickup address when it changes (debounced)
  useEffect(() => {
    if (!pickupAddr || pickupAddr === initialAddress) return;
    
    const timeoutId = setTimeout(() => {
      setIsGeocodingPickup(true);
      geocodeAddress(pickupAddr)
        .then((result) => {
          setPickupCoords({ lat: result.lat, lng: result.lng });
          setPickupAddr(result.address);
        })
        .catch((error) => {
          console.error('Geocoding error for pickup:', error);
          // Don't update coordinates if geocoding fails
          // User can use map selection or current location button instead
        })
        .finally(() => {
          setIsGeocodingPickup(false);
        });
    }, 1000); // Wait 1 second after user stops typing

    return () => clearTimeout(timeoutId);
  }, [pickupAddr, initialAddress]);

  // Geocode dropoff address when it changes (debounced)
  useEffect(() => {
    if (!dropoffAddr) return;
    
    const timeoutId = setTimeout(() => {
      setIsGeocodingDropoff(true);
      geocodeAddress(dropoffAddr)
        .then((result) => {
          setDropoffCoords({ lat: result.lat, lng: result.lng });
          setDropoffAddr(result.address);
        })
        .catch((error) => {
          console.error('Geocoding error:', error);
          // Don't update coordinates if geocoding fails
        })
        .finally(() => {
          setIsGeocodingDropoff(false);
        });
    }, 1000); // Wait 1 second after user stops typing

    return () => clearTimeout(timeoutId);
  }, [dropoffAddr]);

  // Calculate pricing when coordinates are available
  useEffect(() => {
    if (pickupCoords && dropoffCoords) {
      // Set pricing to null while calculating
      setPricing(null);
      
      calculatePricing(
        pickupCoords.lat,
        pickupCoords.lng,
        dropoffCoords.lat,
        dropoffCoords.lng
      )
        .then((breakdown) => {
          setPricing(breakdown);
        })
        .catch((error) => {
          console.error('Error calculating pricing:', error);
          // Keep pricing as null on error
        });
    } else {
      setPricing(null);
    }
  }, [pickupCoords, dropoffCoords]);

  const handleSubmit = async () => {
    if (!user) {
      toast({ title: "Please login", description: "You need to be logged in to book.", variant: "destructive" });
      return;
    }

    if (!pickupCoords) {
      toast({ title: "Pickup Location Required", description: "Please enter a valid pickup location.", variant: "destructive" });
      return;
    }

    if (!dropoffCoords || !dropoffAddr) {
      toast({ title: "Destination Required", description: "Please enter a valid destination.", variant: "destructive" });
      return;
    }

    if (!pricing) {
      toast({ 
        title: "Calculating Price", 
        description: "Please wait while we calculate your fare...", 
        variant: "default" 
      });
      return;
    }

    try {
      const order = await createOrder.mutateAsync({
        type: type as any,
        pickupAddress: pickupAddr,
        pickupLat: pickupCoords.lat,
        pickupLng: pickupCoords.lng,
        dropoffAddress: dropoffAddr,
        dropoffLat: dropoffCoords.lat,
        dropoffLng: dropoffCoords.lng,
        price: Math.round(pricing.basePrice), // Ensure price is integer
        description: notes || undefined,
      });
      
      toast({ title: "Order Created!", description: "Searching for a driver..." });
      setLocation(`/track/${order.id}`);
    } catch (error: any) {
      console.error("Order creation error:", error);
      const errorMessage = error?.message || "Could not create order.";
      toast({ 
        title: "Error", 
        description: errorMessage, 
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row">
      <div className="flex-1 relative order-2 md:order-1 h-[40vh] md:h-full">
        <Map 
          pickup={pickupCoords} 
          dropoff={dropoffCoords}
          interactive={true}
          onMapClick={async (coords) => {
            if (selectionMode === 'pickup') {
              setPickupCoords(coords);
              setIsGeocodingPickup(true);
              try {
                const address = await reverseGeocode(coords.lat, coords.lng);
                setPickupAddr(address);
              } catch (error) {
                setPickupAddr(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
              } finally {
                setIsGeocodingPickup(false);
                setSelectionMode(null);
              }
            } else if (selectionMode === 'dropoff') {
              setDropoffCoords(coords);
              setIsGeocodingDropoff(true);
              try {
                const address = await reverseGeocode(coords.lat, coords.lng);
                setDropoffAddr(address);
              } catch (error) {
                setDropoffAddr(`${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
              } finally {
                setIsGeocodingDropoff(false);
                setSelectionMode(null);
              }
            }
          }}
          selectionMode={selectionMode}
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
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">{t("booking.pickup")}</label>
                    <Button
                      type="button"
                      variant={selectionMode === 'pickup' ? 'default' : 'outline'}
                      size="sm"
                      className="h-6 text-xs px-2"
                      onClick={() => {
                        setSelectionMode(selectionMode === 'pickup' ? null : 'pickup');
                      }}
                    >
                      {selectionMode === 'pickup' ? t("booking.cancel") : t("booking.select_on_map")}
                    </Button>
                  </div>
                  <div className="relative">
                    <Input 
                      value={pickupAddr} 
                      onChange={(e) => setPickupAddr(e.target.value)}
                      placeholder={isLoadingLocation ? "Getting your location..." : "Enter pickup location"}
                      className="bg-secondary/30 pr-10"
                      disabled={isLoadingLocation || selectionMode === 'pickup'}
                    />
                    {(isLoadingLocation || isGeocodingPickup) && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                    )}
                    {!isLoadingLocation && !isGeocodingPickup && selectionMode !== 'pickup' && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => {
                          setIsLoadingLocation(true);
                          getCurrentLocation()
                            .then((coords) => {
                              setPickupCoords(coords);
                              return reverseGeocode(coords.lat, coords.lng);
                            })
                            .then((address) => {
                              setPickupAddr(address);
                              toast({
                                title: "Location Found!",
                                description: `Your location: ${address}`,
                                variant: "default",
                              });
                            })
                            .catch((error) => {
                              console.error('Location button error:', error);
                              toast({
                                title: "Location Not Available",
                                description: "Please enter your address manually or select on the map.",
                                variant: "destructive",
                                duration: 5000,
                              });
                              // Don't set default location - let user enter manually
                            })
                            .finally(() => {
                              setIsLoadingLocation(false);
                            });
                        }}
                        title="Use current location (click to get your GPS location)"
                      >
                        <MapPin className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="mt-3 w-4 h-4 rounded-full bg-accent ring-4 ring-accent/20 shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">{t("booking.dropoff")}</label>
                    <Button
                      type="button"
                      variant={selectionMode === 'dropoff' ? 'default' : 'outline'}
                      size="sm"
                      className="h-6 text-xs px-2"
                      onClick={() => {
                        setSelectionMode(selectionMode === 'dropoff' ? null : 'dropoff');
                      }}
                    >
                      {selectionMode === 'dropoff' ? t("booking.cancel") : t("booking.select_on_map")}
                    </Button>
                  </div>
                  <div className="relative">
                    <Input 
                      value={dropoffAddr} 
                      onChange={(e) => setDropoffAddr(e.target.value)}
                      placeholder="Enter destination"
                      className="bg-secondary/30 pr-10"
                      disabled={selectionMode === 'dropoff'}
                    />
                    {isGeocodingDropoff && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
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
            {pricing ? (
              <Card className="p-4 bg-secondary/20 border-border/50">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">{t("booking.price")}</span>
                    <div className="text-right">
                      <div className="text-2xl font-display font-bold">{t("common.currency")} {pricing.customerPaysCash}</div>
                      <div className="text-xs text-muted-foreground">Cash payment</div>
                    </div>
                  </div>
                  
                  {/* Price Breakdown */}
                  <div className="space-y-1 text-xs border-t border-border/50 pt-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base fare</span>
                      <span>{t("common.currency")} {pricing.baseFare}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Distance ({pricing.distance.toFixed(1)} km)</span>
                      <span>{t("common.currency")} {pricing.distanceCharge.toFixed(2)}</span>
                    </div>
                    {pricing.subtotal < pricing.minimumFare && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Minimum fare applied</span>
                        <span>{t("common.currency")} {pricing.minimumFare}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Payment Option */}
                  <div className="border-t border-border/50 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <CreditCard className="w-3 h-3" />
                        <span>Card payment</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{t("common.currency")} {pricing.customerPaysCard}</div>
                        <div className="text-muted-foreground">+ {t("common.currency")} {pricing.processingFee} fee</div>
                      </div>
                    </div>
                  </div>

                  {/* Distance Info */}
                  <div className="flex gap-4 text-xs text-muted-foreground pt-1">
                    <div className="flex items-center gap-1">
                      <Navigation className="w-3 h-3" /> {pricing.distance.toFixed(1)} km
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-4 bg-secondary/20 border-border/50">
                <div className="text-center text-sm text-muted-foreground">
                  {pickupCoords && dropoffCoords 
                    ? "Calculating price..." 
                    : "Enter pickup and dropoff locations to see price"}
                </div>
              </Card>
            )}
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
