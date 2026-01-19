// Geocoding utilities using OpenStreetMap Nominatim API (free, no API key required)

export interface GeocodeResult {
  lat: number;
  lng: number;
  address: string;
}

/**
 * Geocode an address to coordinates using OpenStreetMap Nominatim
 * @param address - The address to geocode
 * @returns Promise with lat/lng and formatted address
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  if (!address.trim()) {
    throw new Error("Address cannot be empty");
  }

  // Use Nominatim API (free, no API key needed)
  // Add Dominican Republic context for better results
  const searchQuery = encodeURIComponent(`${address}, Dominican Republic`);
  const url = `https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json&limit=1&addressdetails=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MotoGo/1.0', // Required by Nominatim
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      throw new Error(`Address not found: ${address}`);
    }

    const result = data[0];
    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: result.display_name || address,
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
}

/**
 * Reverse geocode coordinates to an address
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Promise with formatted address
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MotoGo/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Reverse geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.display_name || `${lat}, ${lng}`;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return `${lat}, ${lng}`;
  }
}

/**
 * Get user's current location using browser geolocation API
 * @returns Promise with lat/lng
 */
export function getCurrentLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        let message = 'Unable to get your location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission denied. Please enable location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out.';
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

