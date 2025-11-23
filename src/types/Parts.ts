// src/types/Parts.ts

export interface VehiclePart {
  id: string;
  make: string;
  model: string;
  year_start: number;
  year_end: number;
  service_type: string;
  part_type: string;
  part_number: string;
  brand: string | null;
  notes: string | null;
  user_id: string;
  times_used: number;
  verified: boolean;
  flagged_count: number;
  created_at: string;
  updated_at: string;
}

export interface PartUsed {
  type: string;
  number: string;
  brand?: string;
  notes?: string;
}

export interface PartSuggestion extends VehiclePart {
  isPersonal: boolean; // True if this part was added by current user
}

export const COMMON_PART_TYPES = [
  'Oil Filter',
  'Motor Oil',
  'Air Filter',
  'Cabin Air Filter',
  'Fuel Filter',
  'Spark Plugs',
  'Brake Pads',
  'Brake Rotors',
  'Battery',
  'Wiper Blades',
  'Transmission Fluid',
  'Coolant',
  'Other',
] as const;

export type PartType = typeof COMMON_PART_TYPES[number];
