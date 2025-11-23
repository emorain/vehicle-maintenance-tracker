// src/services/ProtocolService.ts
import { supabase } from '../lib/supabaseClient';
import { MaintenanceProtocol, VehicleProtocol, VehicleProtocolWithDetails, MaintenanceDue } from '../types/Protocol';

export class ProtocolService {
  // Get all protocols (defaults + user's custom protocols)
  static async getAllProtocols(): Promise<MaintenanceProtocol[]> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('maintenance_protocols')
      .select('*')
      .or(`is_default.eq.true,user_id.eq.${user.id}`)
      .order('is_default', { ascending: false })
      .order('name');

    if (error) throw error;
    return data as MaintenanceProtocol[];
  }

  // Get protocol by ID
  static async getProtocolById(id: string): Promise<MaintenanceProtocol> {
    const { data, error } = await supabase
      .from('maintenance_protocols')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as MaintenanceProtocol;
  }

  // Create a new custom protocol
  static async createProtocol(protocol: Partial<MaintenanceProtocol>): Promise<MaintenanceProtocol> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const protocolWithUser = {
      ...protocol,
      user_id: user.id,
      is_default: false, // User protocols are never defaults
    };

    const { data, error } = await supabase
      .from('maintenance_protocols')
      .insert([protocolWithUser])
      .select()
      .single();

    if (error) throw error;
    return data as MaintenanceProtocol;
  }

  // Update a custom protocol
  static async updateProtocol(id: string, updates: Partial<MaintenanceProtocol>): Promise<MaintenanceProtocol> {
    const { data, error } = await supabase
      .from('maintenance_protocols')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as MaintenanceProtocol;
  }

  // Delete a custom protocol
  static async deleteProtocol(id: string): Promise<void> {
    const { error } = await supabase
      .from('maintenance_protocols')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Get all protocols assigned to a vehicle
  static async getVehicleProtocols(vehicleId: string): Promise<VehicleProtocolWithDetails[]> {
    const { data, error } = await supabase
      .from('vehicle_protocols')
      .select(`
        *,
        protocol:maintenance_protocols(*)
      `)
      .eq('vehicle_id', vehicleId);

    if (error) throw error;
    return data as VehicleProtocolWithDetails[];
  }

  // Assign a protocol to a vehicle
  static async assignProtocolToVehicle(
    vehicleId: string,
    protocolId: string,
    lastServiceDate?: string,
    lastServiceMileage?: number
  ): Promise<VehicleProtocol> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const assignment = {
      vehicle_id: vehicleId,
      protocol_id: protocolId,
      user_id: user.id,
      last_service_date: lastServiceDate || null,
      last_service_mileage: lastServiceMileage || null,
    };

    const { data, error } = await supabase
      .from('vehicle_protocols')
      .insert([assignment])
      .select()
      .single();

    if (error) throw error;
    return data as VehicleProtocol;
  }

  // Update last service info for a vehicle protocol
  static async updateVehicleProtocol(
    id: string,
    lastServiceDate?: string,
    lastServiceMileage?: number
  ): Promise<VehicleProtocol> {
    const updates: Partial<VehicleProtocol> = {};
    if (lastServiceDate !== undefined) updates.last_service_date = lastServiceDate;
    if (lastServiceMileage !== undefined) updates.last_service_mileage = lastServiceMileage;

    const { data, error } = await supabase
      .from('vehicle_protocols')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as VehicleProtocol;
  }

  // Remove a protocol from a vehicle
  static async removeProtocolFromVehicle(vehicleProtocolId: string): Promise<void> {
    const { error } = await supabase
      .from('vehicle_protocols')
      .delete()
      .eq('id', vehicleProtocolId);

    if (error) throw error;
  }

  // Calculate upcoming/overdue maintenance for a vehicle
  static async calculateMaintenanceDue(
    vehicleId: string,
    currentMileage?: number
  ): Promise<MaintenanceDue[]> {
    const vehicleProtocols = await this.getVehicleProtocols(vehicleId);
    const today = new Date();
    const maintenanceDue: MaintenanceDue[] = [];

    for (const vp of vehicleProtocols) {
      const protocol = vp.protocol;
      let dueDateCalc: Date | null = null;
      let dueMileageCalc: number | null = null;
      let isOverdue = false;
      let daysUntilDue: number | null = null;
      let milesUntilDue: number | null = null;

      // Calculate date-based due date
      if (protocol.interval_months && vp.last_service_date) {
        const lastDate = new Date(vp.last_service_date);
        dueDateCalc = new Date(lastDate);
        dueDateCalc.setMonth(dueDateCalc.getMonth() + protocol.interval_months);

        const diffTime = dueDateCalc.getTime() - today.getTime();
        daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (daysUntilDue < 0) {
          isOverdue = true;
        }
      }

      // Calculate mileage-based due mileage
      if (protocol.interval_miles && vp.last_service_mileage !== null && currentMileage !== undefined) {
        dueMileageCalc = vp.last_service_mileage + protocol.interval_miles;
        milesUntilDue = dueMileageCalc - currentMileage;

        if (milesUntilDue < 0) {
          isOverdue = true;
        }
      }

      maintenanceDue.push({
        protocol_id: protocol.id,
        vehicle_id: vehicleId,
        protocol_name: protocol.name,
        service_type: protocol.service_type,
        due_date: dueDateCalc ? dueDateCalc.toISOString().split('T')[0] : null,
        due_mileage: dueMileageCalc,
        is_overdue: isOverdue,
        days_until_due: daysUntilDue,
        miles_until_due: milesUntilDue,
      });
    }

    // Sort by most urgent first (overdue, then soonest)
    return maintenanceDue.sort((a, b) => {
      if (a.is_overdue && !b.is_overdue) return -1;
      if (!a.is_overdue && b.is_overdue) return 1;

      // Both overdue or both not overdue, sort by soonest
      const aDays = a.days_until_due ?? Infinity;
      const bDays = b.days_until_due ?? Infinity;
      const aMiles = a.miles_until_due ?? Infinity;
      const bMiles = b.miles_until_due ?? Infinity;

      return Math.min(aDays, aMiles) - Math.min(bDays, bMiles);
    });
  }

  // Get all upcoming maintenance across all vehicles for current user
  static async getAllUpcomingMaintenance(): Promise<MaintenanceDue[]> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Get all user's vehicles
    const { data: vehicles, error: vehiclesError } = await supabase
      .from('vehicles')
      .select('id, mileage')
      .eq('user_id', user.id);

    if (vehiclesError) throw vehiclesError;

    // Calculate maintenance due for each vehicle
    const allMaintenance: MaintenanceDue[] = [];
    for (const vehicle of vehicles) {
      const maintenance = await this.calculateMaintenanceDue(vehicle.id, vehicle.mileage || undefined);
      allMaintenance.push(...maintenance);
    }

    return allMaintenance;
  }
}
