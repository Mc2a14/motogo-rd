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
 * Get location using Google Geolocation API (uses WiFi/cell tower data - much more accurate than IP)
 * @returns Promise with lat/lng
 */
async function getLocationByGoogle(): Promise<{ lat: number; lng: number }> {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('Google Maps API key not configured');
  }

  try {
    // Google Geolocation API uses WiFi access points and cell towers for accurate location
    // This is much better than IP-based location
    const response = await fetch(`https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        considerIp: true, // Fallback to IP if WiFi/cell data unavailable
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.location && data.location.lat && data.location.lng) {
        const accuracy = data.accuracy || Infinity; // Accuracy in meters
        const accuracyKm = accuracy / 1000;
        
        console.log('📍 Google Geolocation API result:', {
          lat: data.location.lat,
          lng: data.location.lng,
          accuracy: `${accuracyKm.toFixed(1)}km`,
          accuracyMeters: accuracy
        });
        
        // If accuracy is worse than 5km, it's too inaccurate to use
        // This prevents using IP-based or very inaccurate WiFi-based locations
        if (accuracy > 5000) {
          console.warn('⚠️ Google Geolocation accuracy too low:', `${accuracyKm.toFixed(1)}km`);
          console.warn('⚠️ Rejecting inaccurate location - please use map selection or manual entry');
          throw new Error(`Location accuracy too low (${accuracyKm.toFixed(1)}km). Please select your location on the map or enter it manually.`);
        }
        
        console.log('✅ Location obtained (Google Geolocation API):', {
          lat: data.location.lat,
          lng: data.location.lng,
          accuracy: `${accuracyKm.toFixed(1)}km`
        });
        return {
          lat: data.location.lat,
          lng: data.location.lng,
        };
      }
    } else {
      const errorData = await response.json();
      console.error('❌ Google Geolocation API error:', errorData);
      throw new Error(errorData.error?.message || 'Google Geolocation API failed');
    }
  } catch (error) {
    console.warn('⚠️ Google Geolocation API failed:', error);
    throw error;
  }
  
  throw new Error('Google Geolocation API unavailable');
}

/**
 * Get user's current location using browser geolocation API
 * Falls back to IP-based location if browser geolocation fails
 * @returns Promise with lat/lng
 */
export function getCurrentLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      console.error('❌ Geolocation is not supported by your browser');
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    console.log('📍 Requesting location permission...');

    // Try with high accuracy first (GPS)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('✅ Location obtained (GPS):', {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.warn('⚠️ High-accuracy location failed, trying network-based...', {
          code: error.code,
          message: error.message
        });
        
        // If high accuracy fails, try with lower accuracy (network-based)
        // This is more likely to work in some environments
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('✅ Location obtained (Network):', {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy
            });
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => {
            // Log the actual error for debugging
            let message = 'Unable to get your location';
            let errorType = 'UNKNOWN';
            
            switch (error.code) {
              case error.PERMISSION_DENIED:
                message = 'Location permission denied. Please enable location access in your browser settings.';
                errorType = 'PERMISSION_DENIED';
                break;
              case error.POSITION_UNAVAILABLE:
                message = 'Location information unavailable. Your device may not be able to determine location.';
                errorType = 'POSITION_UNAVAILABLE';
                break;
              case error.TIMEOUT:
                message = 'Location request timed out. Please try again.';
                errorType = 'TIMEOUT';
                break;
            }
            
            console.error('❌ Location failed:', {
              code: error.code,
              type: errorType,
              message: error.message
            });
            
            // If browser geolocation fails, try Google Geolocation API as fallback
            // This uses WiFi access points and cell towers - much more accurate than IP
            console.log('🔄 Trying Google Geolocation API as fallback...');
            getLocationByGoogle()
              .then((coords) => {
                console.log('✅ Google Geolocation API successful');
                resolve(coords);
              })
              .catch((googleError) => {
                console.warn('⚠️ Google Geolocation API failed or inaccurate:', googleError);
                // If Google Geolocation fails or is too inaccurate, reject with helpful message
                // On laptops/desktops, browser geolocation often doesn't work, so we should
                // guide users to use map selection or manual entry instead
                const isLaptop = !navigator.userAgent.match(/Mobile|Android|iPhone|iPad/i);
                if (isLaptop) {
                  reject(new Error('Location not available on this device. Please select your location on the map or enter it manually.'));
                } else {
                  reject(new Error(message));
                }
              });
          },
          {
            enableHighAccuracy: false, // Try network-based location
            timeout: 20000, // Even longer timeout for network location
            maximumAge: 300000, // Accept location up to 5 minutes old
          }
        );
      },
      {
        enableHighAccuracy: true, // Try GPS first
        timeout: 20000, // 20 second timeout
        maximumAge: 0, // Always get fresh location
      }
    );
  });
}

