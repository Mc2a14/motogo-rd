/**
 * Pricing calculation utilities for MotoGo RD
 * 
 * Pricing Structure:
 * - Base Fare: RD$40
 * - Distance Rate: RD$10/km
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
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
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
export function calculatePricing(
  pickupLat: number,
  pickupLng: number,
  dropoffLat: number,
  dropoffLng: number
): PricingBreakdown {
  // Constants
  const BASE_FARE = 40;
  const DISTANCE_RATE = 10; // per km
  const MINIMUM_FARE = 50;
  const DRIVER_PERCENTAGE = 0.85; // 85%
  const PLATFORM_PERCENTAGE = 0.15; // 15%
  const PROCESSING_FEE_PERCENTAGE = 0.03; // 3%

  // Calculate distance
  const distance = calculateDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);
  
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
