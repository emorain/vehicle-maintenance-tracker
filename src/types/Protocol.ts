// src/types/Protocol.ts

export interface MaintenanceProtocol {
  id: string;
  user_id: string | null;
  name: string;
  service_type: string;
  interval_months: number | null;
  interval_miles: number | null;
  description: string | null;
  is_default: boolean;
  created_at: string;
}

export interface VehicleProtocol {
  id: string;
  vehicle_id: string;
  protocol_id: string;
  user_id: string;
  last_service_date: string | null;
  last_service_mileage: number | null;
  created_at: string;
}

// Extended type that includes protocol details for display
export interface VehicleProtocolWithDetails extends VehicleProtocol {
  protocol: MaintenanceProtocol;
}

// Type for calculating when maintenance is due
export interface MaintenanceDue {
  protocol_id: string;
  vehicle_id: string;
  protocol_name: string;
  service_type: string;
  due_date: string | null;
  due_mileage: number | null;
  is_overdue: boolean;
  days_until_due: number | null;
  miles_until_due: number | null;
}
