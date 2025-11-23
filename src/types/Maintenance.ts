export interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  user_id: string;
  service_type: string;
  description?: string;
  service_date: string; // ISO date string
  mileage?: number;
  cost?: number;
  notes?: string;
  parts_used?: any[]; // JSONB array of parts
  created_at: string;
  updated_at: string;
}

export const SERVICE_TYPES = [
  'Oil Change',
  'Tire Rotation',
  'Brake Service',
  'Air Filter Replacement',
  'Battery Replacement',
  'Coolant Flush',
  'Transmission Service',
  'Inspection',
  'Repair',
  'Other',
] as const;

export type ServiceType = typeof SERVICE_TYPES[number];
