import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { useOrders } from "@/hooks/use-orders";
import { useLanguage } from "@/hooks/use-language";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function History() {
  const { data: orders, isLoading } = useOrders();
  const { t } = useLanguage();

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading history...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-background md:bg-secondary/20">
      <div className="p-6 md:p-10 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-display font-bold mb-8">{t("nav.history")}</h1>
        
        <div className="space-y-4">
          {orders?.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p>No orders yet.</p>
              <Button variant="link" asChild className="mt-2 text-accent">
                <Link href="/">Make your first order</Link>
              </Button>
            </div>
          ) : (
            orders?.map((order) => (
              <Link key={order.id} href={`/track/${order.id}`}>
                <Card className="p-4 md:p-6 hover:shadow-lg transition-all cursor-pointer border-border/50 group">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                          {t(`status.${order.status}`)}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(order.createdAt || ""), "MMM d, yyyy h:mm a")}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg capitalize">{t(`service.${order.type}`)}</h3>
                    </div>

                    <div className="flex-1 md:px-8 space-y-2">
                       <div className="flex items-center gap-2 text-sm text-muted-foreground">
                         <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                         <span className="truncate max-w-[200px]">{order.pickupAddress}</span>
                         <ArrowRight className="w-4 h-4 shrink-0" />
                         <MapPin className="w-4 h-4 text-accent shrink-0" />
                         <span className="truncate max-w-[200px]">{order.dropoffAddress}</span>
                       </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6">
                      <span className="font-display font-bold text-lg">
                        {t("common.currency")} {order.price}
                      </span>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
