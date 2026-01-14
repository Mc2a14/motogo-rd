## Packages
leaflet | Maps library
react-leaflet | React components for Leaflet maps
framer-motion | Smooth animations for UI elements
clsx | Conditional class names
tailwind-merge | Merging tailwind classes

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  display: ["'Outfit', sans-serif"],
  body: ["'DM Sans', sans-serif"],
}

Integration assumptions:
- Maps will default to Santo Domingo coordinates (18.4861, -69.9312)
- Auth is handled by Replit Auth (use-auth.ts hook provided by system)
- Leaflet CSS needs to be imported in index.css or App.tsx
