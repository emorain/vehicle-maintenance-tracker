// src/services/PartsService.ts
import { supabase } from '../lib/supabaseClient';
import { VehiclePart, PartSuggestion } from '../types/Parts';

export class PartsService {
  // Get suggested parts for a vehicle and service type
  static async getSuggestedParts(
    make: string,
    model: string,
    year: number,
    serviceType: string,
    myPartsOnly: boolean = false
  ): Promise<PartSuggestion[]> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    let query = supabase
      .from('vehicle_parts')
      .select('*')
      .eq('make', make)
      .eq('model', model)
      .lte('year_start', year)
      .gte('year_end', year)
      .eq('service_type', serviceType)
      .lte('flagged_count', 2) // Hide heavily flagged parts
      .order('verified', { ascending: false }) // Verified first
      .order('times_used', { ascending: false }); // Then by popularity

    // Filter to user's parts only if requested
    if (myPartsOnly) {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Mark which parts belong to current user
    return (data as VehiclePart[]).map(part => ({
      ...part,
      isPersonal: part.user_id === user.id,
    }));
  }

  // Add a new part to the database
  static async addPart(part: Omit<VehiclePart, 'id' | 'user_id' | 'times_used' | 'verified' | 'flagged_count' | 'created_at' | 'updated_at'>): Promise<VehiclePart> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const newPart = {
      ...part,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from('vehicle_parts')
      .insert([newPart])
      .select()
      .single();

    if (error) throw error;
    return data as VehiclePart;
  }

  // Increment usage count for a part
  static async incrementPartUsage(partId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_part_usage', { part_id: partId });

    // If RPC doesn't exist, fall back to manual increment
    if (error && error.code === '42883') {
      const { data: part } = await supabase
        .from('vehicle_parts')
        .select('times_used')
        .eq('id', partId)
        .single();

      if (part) {
        await supabase
          .from('vehicle_parts')
          .update({ times_used: part.times_used + 1 })
          .eq('id', partId);
      }
    } else if (error) {
      throw error;
    }
  }

  // Flag a part as incorrect
  static async flagPart(partId: string): Promise<void> {
    const { data: part } = await supabase
      .from('vehicle_parts')
      .select('flagged_count')
      .eq('id', partId)
      .single();

    if (part) {
      await supabase
        .from('vehicle_parts')
        .update({ flagged_count: part.flagged_count + 1 })
        .eq('id', partId);
    }
  }

  // Get all parts for a specific vehicle (for browsing)
  static async getPartsByVehicle(
    make: string,
    model: string,
    year: number
  ): Promise<VehiclePart[]> {
    const { data, error } = await supabase
      .from('vehicle_parts')
      .select('*')
      .eq('make', make)
      .eq('model', model)
      .lte('year_start', year)
      .gte('year_end', year)
      .lte('flagged_count', 2)
      .order('service_type')
      .order('part_type');

    if (error) throw error;
    return data as VehiclePart[];
  }

  // Search parts by part number or brand
  static async searchParts(query: string): Promise<VehiclePart[]> {
    const { data, error } = await supabase
      .from('vehicle_parts')
      .select('*')
      .or(`part_number.ilike.%${query}%,brand.ilike.%${query}%`)
      .lte('flagged_count', 2)
      .order('times_used', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data as VehiclePart[];
  }

  // Delete a part (user can only delete their own)
  static async deletePart(partId: string): Promise<void> {
    const { error } = await supabase
      .from('vehicle_parts')
      .delete()
      .eq('id', partId);

    if (error) throw error;
  }

  // Update a part (user can only update their own)
  static async updatePart(partId: string, updates: Partial<VehiclePart>): Promise<VehiclePart> {
    const { data, error } = await supabase
      .from('vehicle_parts')
      .update(updates)
      .eq('id', partId)
      .select()
      .single();

    if (error) throw error;
    return data as VehiclePart;
  }
}
