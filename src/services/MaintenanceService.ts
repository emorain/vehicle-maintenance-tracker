import { supabase } from '../lib/supabaseClient';
import { MaintenanceRecord } from '../types/Maintenance';

export const MaintenanceService = {
  /**
   * Get all maintenance records for a specific vehicle
   */
  async getMaintenanceByVehicle(vehicleId: string): Promise<MaintenanceRecord[]> {
    const { data, error } = await supabase
      .from('maintenance_records')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('service_date', { ascending: false });

    if (error) throw error;
    return (data as MaintenanceRecord[]) ?? [];
  },

  /**
   * Get all maintenance records for the current user
   */
  async getAllMaintenance(): Promise<MaintenanceRecord[]> {
    const { data, error } = await supabase
      .from('maintenance_records')
      .select('*')
      .order('service_date', { ascending: false });

    if (error) throw error;
    return (data as MaintenanceRecord[]) ?? [];
  },

  /**
   * Get a single maintenance record by ID
   */
  async getMaintenanceById(id: string): Promise<MaintenanceRecord | null> {
    const { data, error } = await supabase
      .from('maintenance_records')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as MaintenanceRecord | null;
  },

  /**
   * Add a new maintenance record
   */
  async addMaintenance(
    maintenance: Partial<MaintenanceRecord>
  ): Promise<MaintenanceRecord> {
    // Get the current user's ID
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Add user_id to the maintenance data
    const maintenanceWithUser = {
      ...maintenance,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from('maintenance_records')
      .insert([maintenanceWithUser])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as MaintenanceRecord;
  },

  /**
   * Update an existing maintenance record
   */
  async updateMaintenance(
    id: string,
    updates: Partial<MaintenanceRecord>
  ): Promise<MaintenanceRecord> {
    const { data, error } = await supabase
      .from('maintenance_records')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as MaintenanceRecord;
  },

  /**
   * Delete a maintenance record
   */
  async deleteMaintenance(id: string): Promise<void> {
    const { error } = await supabase
      .from('maintenance_records')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get recent maintenance records (last N records)
   */
  async getRecentMaintenance(limit: number = 5): Promise<MaintenanceRecord[]> {
    const { data, error } = await supabase
      .from('maintenance_records')
      .select('*')
      .order('service_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data as MaintenanceRecord[]) ?? [];
  },

  /**
   * Get total maintenance cost for a vehicle
   */
  async getTotalCostByVehicle(vehicleId: string): Promise<number> {
    const records = await this.getMaintenanceByVehicle(vehicleId);
    return records.reduce((total, record) => total + (record.cost || 0), 0);
  },
};
