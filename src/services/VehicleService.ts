import { supabase } from '../lib/supabaseClient';
import { Vehicle } from '../types/Vehicle';

export const VehicleService = {
  async getVehicles(): Promise<Vehicle[]> {
    const { data, error } = await supabase
      .from('vehicles')      // <-- remove generics
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Vehicle[] ?? [];
  },

  async getVehicleById(id: string): Promise<Vehicle | null> {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as Vehicle | null;
  },

  async addVehicle(vehicle: Partial<Vehicle>): Promise<Vehicle> {
    // Get the current user's ID
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Add user_id to the vehicle data
    const vehicleWithUser = {
      ...vehicle,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from('vehicles')
      .insert([vehicleWithUser])
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Vehicle;
  },

  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle> {
    const { data, error } = await supabase
      .from('vehicles')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data as Vehicle;
  },

  async deleteVehicle(id: string): Promise<void> {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
