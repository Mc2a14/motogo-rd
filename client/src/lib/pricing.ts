/**
 * Pricing calculation utilities for MotoGo RD
 * 
 * Pricing Structure:
 * - Base Fare: RD$30
 * - Distance Rate: RD$12/km
 * - Minimum Fare: RD$50
 * - Platform Commission: 15% (Driver gets 85%)
 * - Card Processing Fee: 3% (customer pays, separate)
 * - All amounts rounded UP to nearest RD$5
 */

export interface PricingBreakdown {
  baseFare: number; // RD$40
  distance: number; // in km
  distanceCharge: number; // distance × RD$10
  subtotal: number; // baseFare + distanceCharge
  minimumFare: number; // RD$50
  basePrice: number; // max(minimumFare, subtotal) - this is what gets stored
  
  // Earnings (rounded UP to nearest RD$5)
  driverEarnings: number; // basePrice × 85%, rounded UP
  platformEarnings: number; // basePrice × 15%, rounded UP
  
  // Customer payment
  customerPaysCash: number; // driverEarnings + platformEarnings
  customerPaysCard: number; // customerPaysCash + processingFee
  processingFee: number; // basePrice × 3%, rounded UP
}

/**
 * Calculate road distance between two coordinates using Google Maps Distance Matrix API
 * Falls back to Haversine formula if API fails or key is not configured
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in kilometers
 */
export async function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): Promise<number> {
  // Get Google Maps API key from environment variable
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  // Debug logging
  console.log('[Distance Calculation] API Key present:', !!apiKey);
  console.log('[Distance Calculation] API Key length:', apiKey ? apiKey.length : 0);
  
  if (!apiKey) {
    console.warn('⚠️ Google Maps API key not configured, using Haversine fallback (straight-line distance)');
    console.warn('⚠️ To fix: Add VITE_GOOGLE_MAPS_API_KEY to Railway environment variables');
    return calculateHaversineDistance(lat1, lng1, lat2, lng2);
  }

  try {
    // Use Google Maps Distance Matrix API for accurate road distance
    // Format: latitude,longitude
    const origins = `${lat1},${lng1}`;
    const destinations = `${lat2},${lng2}`;
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&units=metric&key=${apiKey}`;
    
    console.log('[Distance Calculation] 🚀 Calling Google Maps Distance Matrix API...');
    console.log('[Distance Calculation] 📍 Origins:', origins);
    console.log('[Distance Calculation] 📍 Destinations:', destinations);
    
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      console.log('[Distance Calculation] 📦 Google Maps API full response:', JSON.stringify(data, null, 2));
      
      if (data.status === 'OK' && data.rows?.[0]?.elements?.[0]?.status === 'OK') {
        // Distance is in meters, convert to km
        const distanceMeters = data.rows[0].elements[0].distance.value;
        const distanceKm = distanceMeters / 1000;
        const roundedDistance = Math.round(distanceKm * 100) / 100;
        const duration = data.rows[0].elements[0].duration?.text || 'unknown';
        
        console.log('✅✅✅ Google Maps Distance Matrix API SUCCESS ✅✅✅');
        console.log('📍 Road Distance:', {
          meters: distanceMeters,
          kilometers: roundedDistance,
          duration: duration,
          status: data.rows[0].elements[0].status
        });
        console.log('📍 Full route element:', data.rows[0].elements[0]);
        
        return roundedDistance;
      } else {
        const elementStatus = data.rows?.[0]?.elements?.[0]?.status;
        const errorMessage = data.error_message || 'Unknown error';
        console.error('❌❌❌ Google Maps API returned error status ❌❌❌');
        console.error('API Status:', data.status);
        console.error('Element Status:', elementStatus);
        console.error('Error Message:', errorMessage);
        console.error('Full response:', JSON.stringify(data, null, 2));
        
        // Check if it's a specific error we can handle
        if (elementStatus === 'ZERO_RESULTS') {
          console.warn('⚠️ No route found between points, using Haversine fallback');
        } else if (elementStatus === 'NOT_FOUND') {
          console.warn('⚠️ Origin or destination not found, using Haversine fallback');
        }
      }
    } else {
      const errorText = await response.text();
      console.error('❌❌❌ Google Maps API HTTP error ❌❌❌');
      console.error('HTTP Status:', response.status);
      console.error('Error Response:', errorText);
    }
  } catch (error) {
    console.error('❌❌❌ Google Maps API request failed ❌❌❌');
    console.error('Error details:', error);
  }

  // Fallback to Haversine formula (straight-line distance)
  const haversineDistance = calculateHaversineDistance(lat1, lng1, lat2, lng2);
  console.warn('⚠️⚠️⚠️ FALLING BACK TO HAVERSINE (STRAIGHT-LINE) DISTANCE ⚠️⚠️⚠️');
  console.warn('⚠️ This is NOT accurate for road distance!');
  console.warn('⚠️ Haversine distance:', haversineDistance, 'km');
  console.warn('⚠️ Road distance would be longer. Check API key and Distance Matrix API enablement.');
  return haversineDistance;
}

/**
 * Calculate straight-line distance using Haversine formula (fallback)
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in kilometers
 */
function calculateHaversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Round UP to nearest RD$5
 * @param amount Amount to round
 * @returns Rounded amount (multiple of 5)
 */
export function roundToNearest5(amount: number): number {
  return Math.ceil(amount / 5) * 5;
}

/**
 * Calculate pricing breakdown for an order
 * @param pickupLat Pickup latitude
 * @param pickupLng Pickup longitude
 * @param dropoffLat Dropoff latitude
 * @param dropoffLng Dropoff longitude
 * @returns Pricing breakdown
 */
export async function calculatePricing(
  pickupLat: number,
  pickupLng: number,
  dropoffLat: number,
  dropoffLng: number
): Promise<PricingBreakdown> {
  // Constants
  const BASE_FARE = 30;
  const DISTANCE_RATE = 12; // per km
  const MINIMUM_FARE = 50;
  const DRIVER_PERCENTAGE = 0.85; // 85%
  const PLATFORM_PERCENTAGE = 0.15; // 15%
  const PROCESSING_FEE_PERCENTAGE = 0.03; // 3%

  // Calculate distance (road distance via API, falls back to Haversine)
  const distance = await calculateDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);
  
  // Calculate base pricing
  const distanceCharge = distance * DISTANCE_RATE;
  const subtotal = BASE_FARE + distanceCharge;
  const basePrice = Math.max(MINIMUM_FARE, subtotal);

  // Calculate earnings (rounded UP to nearest RD$5)
  const driverEarningsRaw = basePrice * DRIVER_PERCENTAGE;
  const platformEarningsRaw = basePrice * PLATFORM_PERCENTAGE;
  
  const driverEarnings = roundToNearest5(driverEarningsRaw);
  const platformEarnings = roundToNearest5(platformEarningsRaw);

  // Customer payment (cash)
  const customerPaysCash = driverEarnings + platformEarnings;

  // Card processing fee (rounded UP)
  const processingFeeRaw = basePrice * PROCESSING_FEE_PERCENTAGE;
  const processingFee = roundToNearest5(processingFeeRaw);
  
  // Customer payment (card)
  const customerPaysCard = customerPaysCash + processingFee;

  return {
    baseFare: BASE_FARE,
    distance,
    distanceCharge,
    subtotal,
    minimumFare: MINIMUM_FARE,
    basePrice,
    driverEarnings,
    platformEarnings,
    customerPaysCash,
    customerPaysCard,
    processingFee,
  };
}
