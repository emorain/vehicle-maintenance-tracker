// src/types/Fuel.ts

export interface FuelRecord {
  id: string;
  vehicle_id: string;
  user_id: string;
  fill_date: string; // ISO date string
  odometer: number;
  gallons: number;
  price_per_gallon?: number;
  total_cost?: number;
  station_name?: string;
  location?: string;
  fuel_grade?: FuelGrade;
  trip_type?: TripType;
  partial_fill: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const FUEL_GRADES = [
  'Regular',
  'Mid-grade',
  'Premium',
  'Diesel',
  'E85',
  'Electric',
] as const;

export type FuelGrade = typeof FUEL_GRADES[number];

export const TRIP_TYPES = [
  'Personal',
  'Business',
  'Mixed',
] as const;

export type TripType = typeof TRIP_TYPES[number];

// Calculated statistics
export interface FuelStats {
  totalFillUps: number;
  totalGallons: number;
  totalCost: number;
  averageMPG: number;
  averageCostPerGallon: number;
  averageCostPerMile: number;
  bestMPG: number;
  worstMPG: number;
  milesTracked: number;
}

export interface FuelRecordWithMPG extends FuelRecord {
  mpg?: number; // Calculated from this fill-up
  miles_driven?: number; // Since last fill-up
}
