import { motion } from "framer-motion";
import { Bike, Package, Utensils, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";

export type ServiceType = "ride" | "food" | "document" | "errand";

interface ServiceCardProps {
  type: ServiceType;
  selected?: boolean;
  onClick: () => void;
}

export function ServiceCard({ type, selected, onClick }: ServiceCardProps) {
  const { t } = useLanguage();

  const config = {
    ride: {
      icon: Bike,
      label: t("service.ride"),
      desc: t("service.ride_desc"),
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-950/20",
    },
    food: {
      icon: Utensils,
      label: t("service.food"),
      desc: t("service.food_desc"),
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-950/20",
    },
    document: {
      icon: Briefcase,
      label: t("service.document"),
      desc: t("service.document_desc"),
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/20",
    },
    errand: {
      icon: Package,
      label: t("service.errand"),
      desc: t("service.errand_desc"),
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-950/20",
    },
  };

  const { icon: Icon, label, desc, color, bg } = config[type];

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-200 w-full text-left h-full",
        selected 
          ? "border-accent bg-accent/5 shadow-md" 
          : "border-transparent bg-secondary/50 hover:bg-secondary hover:border-border"
      )}
    >
      <div className={cn("p-2 rounded-lg mb-3", bg)}>
        <Icon className={cn("w-6 h-6", color)} />
      </div>
      <h3 className="font-display font-bold text-lg leading-tight">{label}</h3>
      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{desc}</p>
      
      {selected && (
        <div className="absolute top-3 right-3 w-3 h-3 bg-accent rounded-full animate-pulse" />
      )}
    </motion.button>
  );
}
