import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type Language = "en" | "es";

interface Translations {
  [key: string]: {
    en: string;
    es: string;
  };
}

const translations: Translations = {
  // Navigation
  "nav.home": { en: "Home", es: "Inicio" },
  "nav.history": { en: "History", es: "Historial" },
  "nav.profile": { en: "Profile", es: "Perfil" },
  "nav.login": { en: "Login", es: "Iniciar Sesión" },
  "nav.logout": { en: "Logout", es: "Cerrar sesión" },
  
  // Home
  "home.greeting": { en: "Where to?", es: "¿A dónde vas?" },
  "home.search_placeholder": { en: "Enter destination", es: "Ingresa destino" },
  
  // Services
  "service.ride": { en: "Moto Ride", es: "Motoconcho" },
  "service.ride_desc": { en: "Fast & affordable city rides", es: "Viajes rápidos y económicos" },
  "service.food": { en: "Food", es: "Comida" },
  "service.food_desc": { en: "Delivery from restaurants", es: "Delivery de restaurantes" },
  "service.document": { en: "Courier", es: "Mensajería" },
  "service.document_desc": { en: "Send docs & packages", es: "Envía documentos y paquetes" },
  "service.errand": { en: "Errands", es: "Diligencias" },
  "service.errand_desc": { en: "We do it for you", es: "Lo hacemos por ti" },
  
  // Booking
  "booking.pickup": { en: "Pickup Location", es: "Punto de partida" },
  "booking.dropoff": { en: "Dropoff Location", es: "Destino" },
  "booking.price": { en: "Est. Price", es: "Precio Est." },
  "booking.confirm": { en: "Confirm Order", es: "Confirmar Orden" },
  "booking.details": { en: "Details (Optional)", es: "Detalles (Opcional)" },
  "booking.creating": { en: "Creating order...", es: "Creando orden..." },
  
  // Status
  "status.pending": { en: "Finding driver...", es: "Buscando conductor..." },
  "status.accepted": { en: "Driver on the way", es: "Conductor en camino" },
  "status.in_progress": { en: "Ride in progress", es: "Viaje en curso" },
  "status.completed": { en: "Completed", es: "Completado" },
  "status.cancelled": { en: "Cancelled", es: "Cancelado" },
  
  // Auth
  "auth.login": { en: "Log in to ride", es: "Inicia sesión para viajar" },
  "auth.register": { en: "Sign up", es: "Registrarse" },
  "auth.welcome": { en: "Welcome back", es: "Bienvenido de nuevo" },
  
  // Common
  "common.back": { en: "Back", es: "Atrás" },
  "common.settings": { en: "Settings", es: "Configuración" },
  "common.language": { en: "Language", es: "Idioma" },
  "common.theme": { en: "Theme", es: "Tema" },
  "common.dark": { en: "Dark", es: "Oscuro" },
  "common.light": { en: "Light", es: "Claro" },
  "common.currency": { en: "DOP", es: "RD$" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Default to Spanish as requested for Dominican Republic context
  const [language, setLanguage] = useState<Language>("es");

  const t = (key: string) => {
    if (!translations[key]) return key;
    return translations[key][language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
