// Geocoding utilities using OpenStreetMap Nominatim API (free, no API key required)

export interface GeocodeResult {
  lat: number;
  lng: number;
  address: string;
}

/**
 * Geocode an address to coordinates using OpenStreetMap Nominatim
 * Falls back to Google Maps Geocoding API if available and Nominatim fails
 * @param address - The address to geocode
 * @returns Promise with lat/lng and formatted address
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  if (!address.trim()) {
    throw new Error("Address cannot be empty");
  }

  // Try Nominatim first (free, no API key needed)
  try {
    // Try with full address first
    let searchQuery = encodeURIComponent(`${address}, Dominican Republic`);
    let url = `https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json&limit=3&addressdetails=1`;
    
    let response = await fetch(url, {
      headers: {
        'User-Agent': 'MotoGo/1.0', // Required by Nominatim
      },
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data && data.length > 0) {
        // Find best match (prefer exact matches)
        const result = data[0];
        console.log('✅ Nominatim geocoding success:', result.display_name);
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          address: result.display_name || address,
        };
      }
    }

    // If no results, try without "Dominican Republic" suffix (sometimes helps)
    if (address.includes('Dominican Republic')) {
      const addressWithoutDR = address.replace(/,?\s*Dominican Republic/gi, '').trim();
      searchQuery = encodeURIComponent(`${addressWithoutDR}, Dominican Republic`);
      url = `https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json&limit=3&addressdetails=1`;
      
      response = await fetch(url, {
        headers: {
          'User-Agent': 'MotoGo/1.0',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const result = data[0];
          console.log('✅ Nominatim geocoding success (retry):', result.display_name);
          return {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            address: result.display_name || address,
          };
        }
      }
    }

    // Try Google Maps Geocoding API as fallback if API key is available
    const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (googleApiKey) {
      console.log('🔄 Trying Google Maps Geocoding API as fallback...');
      const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&region=do&key=${googleApiKey}`;
      
      const googleResponse = await fetch(googleUrl);
      if (googleResponse.ok) {
        const googleData = await googleResponse.json();
        if (googleData.status === 'OK' && googleData.results && googleData.results.length > 0) {
          const result = googleData.results[0];
          const location = result.geometry.location;
          console.log('✅ Google Maps geocoding success:', result.formatted_address);
          return {
            lat: location.lat,
            lng: location.lng,
            address: result.formatted_address || address,
          };
        }
      }
    }

    // If all else fails, throw error
    throw new Error(`Address not found: ${address}`);
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

    // Try with high accuracy first (GPS)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        // If high accuracy fails, try with lower accuracy (network-based)
        // This is more likely to work in some environments
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => {
            // If both attempts fail, reject
            let message = 'Unable to get your location';
            switch (error.code) {
              case error.PERMISSION_DENIED:
                message = 'Location permission denied';
                break;
              case error.POSITION_UNAVAILABLE:
                message = 'Location information unavailable';
                break;
              case error.TIMEOUT:
                message = 'Location request timed out';
                break;
            }
            reject(new Error(message));
          },
          {
            enableHighAccuracy: false, // Try network-based location
            timeout: 15000, // Longer timeout for network location
            maximumAge: 300000, // Accept location up to 5 minutes old
          }
        );
      },
      {
        enableHighAccuracy: true, // Try GPS first
        timeout: 15000, // 15 second timeout
        maximumAge: 0, // Always get fresh location
      }
    );
  });
}

