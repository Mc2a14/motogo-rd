import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useTheme } from "@/hooks/use-theme";
import { useDrivers } from "@/hooks/use-orders";

// Fix Leaflet default icon issue
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Santo Domingo Center
const CENTER = { lat: 18.4861, lng: -69.9312 };

// Driver Icon
const createDriverIcon = (color: string) => L.divIcon({
  className: "custom-div-icon",
  html: `<div class="driver-marker-container">
    <div class="driver-marker-pulse" style="background-color: ${color}"></div>
    <div class="driver-marker-core" style="background-color: ${color}"></div>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Map controller to handle theme changes or updates
function MapController() {
  const map = useMap();
  const { theme } = useTheme();

  useEffect(() => {
    map.invalidateSize();
  }, [theme, map]);

  return null;
}

// Component to fit map bounds to show pickup and dropoff
function FitBounds({ pickup, dropoff }: { pickup?: { lat: number; lng: number } | null; dropoff?: { lat: number; lng: number } | null }) {
  const map = useMap();

  useEffect(() => {
    if (pickup && dropoff) {
      // Create bounds to fit both points
      const bounds = L.latLngBounds(
        [pickup.lat, pickup.lng],
        [dropoff.lat, dropoff.lng]
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (pickup) {
      // If only pickup, center on it
      map.setView([pickup.lat, pickup.lng], 15);
    } else if (dropoff) {
      // If only dropoff, center on it
      map.setView([dropoff.lat, dropoff.lng], 15);
    }
  }, [pickup, dropoff, map]);

  return null;
}

interface MapProps {
  className?: string;
  pickup?: { lat: number; lng: number } | null;
  dropoff?: { lat: number; lng: number } | null;
  showDrivers?: boolean;
  onCenterChange?: (center: { lat: number; lng: number }) => void;
  interactive?: boolean;
}

export default function Map({ 
  className = "h-full w-full", 
  pickup, 
  dropoff, 
  showDrivers = true,
  onCenterChange,
  interactive = true
}: MapProps) {
  const { theme } = useTheme();
  const { data: drivers } = useDrivers();
  
  // Calculate center based on pickup/dropoff or default to Santo Domingo
  const calculateCenter = () => {
    if (pickup && dropoff) {
      // Center between pickup and dropoff
      return {
        lat: (pickup.lat + dropoff.lat) / 2,
        lng: (pickup.lng + dropoff.lng) / 2
      };
    } else if (pickup) {
      return pickup;
    } else if (dropoff) {
      return dropoff;
    }
    return CENTER;
  };

  const mapCenter = calculateCenter();

  // Dark mode map tiles vs Light mode
  const tileUrl = theme === 'dark' 
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

  return (
    <div className={`relative ${className} z-0 overflow-hidden rounded-xl`}>
      <MapContainer 
        // @ts-ignore
        center={[mapCenter.lat, mapCenter.lng]} 
        zoom={pickup || dropoff ? 12 : 13} 
        scrollWheelZoom={interactive}
        dragging={interactive}
        zoomControl={false}
        className="h-full w-full"
        style={{ background: 'var(--background)' }}
      >
        {/* @ts-ignore */}
        <TileLayer url={tileUrl} attribution={attribution} />
        <MapController />
        <FitBounds pickup={pickup} dropoff={dropoff} />

               {/* Pickup Marker */}
               {pickup && pickup.lat && pickup.lng && (
                 <Marker position={[pickup.lat, pickup.lng]}>
                   <Popup>Pickup Location</Popup>
                 </Marker>
               )}

               {/* Dropoff Marker */}
               {dropoff && dropoff.lat && dropoff.lng && (
                 <Marker position={[dropoff.lat, dropoff.lng]}>
                   <Popup>Dropoff Location</Popup>
                 </Marker>
               )}

        {/* Mock/Real Drivers */}
        {showDrivers && drivers?.map((driver) => (
          driver.currentLat && driver.currentLng && (
            <Marker 
              key={driver.id} 
              position={[driver.currentLat, driver.currentLng]}
              // @ts-ignore
              icon={createDriverIcon('#f97316')} // Orange accent
            />
          )
        ))}
        
        {/* If no real drivers, add some mocks for visual appeal */}
        {showDrivers && !drivers?.length && (
          <>
            {/* @ts-ignore */}
            <Marker position={[18.485, -69.935]} icon={createDriverIcon('#f97316')} />
            {/* @ts-ignore */}
            <Marker position={[18.490, -69.925]} icon={createDriverIcon('#f97316')} />
            {/* @ts-ignore */}
            <Marker position={[18.480, -69.940]} icon={createDriverIcon('#f97316')} />
          </>
        )}
      </MapContainer>
      
      {/* Center Indicator for "Drag to set pickup" UX */}
      {!pickup && interactive && onCenterChange && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[400] pointer-events-none">
          <div className="relative">
            <div className="w-4 h-4 bg-black dark:bg-white rounded-full border-2 border-white dark:border-black shadow-lg"></div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              Center map here
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
