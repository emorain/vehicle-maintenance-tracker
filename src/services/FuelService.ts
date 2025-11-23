// src/services/FuelService.ts
import { supabase } from '../lib/supabaseClient';
import { FuelRecord, FuelStats, FuelRecordWithMPG } from '../types/Fuel';

export class FuelService {
  // Get all fuel records for a vehicle
  static async getFuelRecords(vehicleId: string): Promise<FuelRecordWithMPG[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('fuel_records')
      .select('*')
      .eq('vehicle_id', vehicleId)
      .order('fill_date', { ascending: false })
      .order('odometer', { ascending: false });

    if (error) throw error;

    // Calculate MPG for each record
    return this.calculateMPGForRecords(data || []);
  }

  // Add new fuel record
  static async addFuelRecord(record: Partial<FuelRecord>): Promise<FuelRecord> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('fuel_records')
      .insert({
        ...record,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Update vehicle mileage if this is the most recent fill-up
    if (record.odometer) {
      await this.updateVehicleMileage(record.vehicle_id!, record.odometer);
    }

    return data;
  }

  // Update fuel record
  static async updateFuelRecord(
    id: string,
    updates: Partial<FuelRecord>
  ): Promise<FuelRecord> {
    const { data, error } = await supabase
      .from('fuel_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update vehicle mileage if odometer changed
    if (updates.odometer) {
      await this.updateVehicleMileage(data.vehicle_id, updates.odometer);
    }

    return data;
  }

  // Delete fuel record
  static async deleteFuelRecord(id: string): Promise<void> {
    const { error } = await supabase
      .from('fuel_records')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Calculate MPG for each record
  private static calculateMPGForRecords(records: FuelRecord[]): FuelRecordWithMPG[] {
    // Sort by date and odometer (oldest first for calculation)
    const sorted = [...records].sort((a, b) => {
      const dateCompare = new Date(a.fill_date).getTime() - new Date(b.fill_date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return a.odometer - b.odometer;
    });

    const withMPG: FuelRecordWithMPG[] = [];

    for (let i = 0; i < sorted.length; i++) {
      const current = sorted[i];
      const previous = sorted[i - 1];

      let mpg: number | undefined;
      let miles_driven: number | undefined;

      if (previous && !current.partial_fill) {
        miles_driven = current.odometer - previous.odometer;
        if (miles_driven > 0 && current.gallons > 0) {
          mpg = miles_driven / current.gallons;
        }
      }

      withMPG.push({
        ...current,
        mpg,
        miles_driven,
      });
    }

    // Return in reverse order (newest first for display)
    return withMPG.reverse();
  }

  // Calculate fuel statistics for a vehicle
  static async getFuelStats(vehicleId: string): Promise<FuelStats> {
    const records = await this.getFuelRecords(vehicleId);

    if (records.length === 0) {
      return {
        totalFillUps: 0,
        totalGallons: 0,
        totalCost: 0,
        averageMPG: 0,
        averageCostPerGallon: 0,
        averageCostPerMile: 0,
        bestMPG: 0,
        worstMPG: 0,
        milesTracked: 0,
      };
    }

    const totalFillUps = records.length;
    const totalGallons = records.reduce((sum, r) => sum + r.gallons, 0);
    const totalCost = records.reduce((sum, r) => sum + (r.total_cost || 0), 0);

    const mpgValues = records
      .filter(r => r.mpg && r.mpg > 0 && r.mpg < 100) // Filter out invalid MPG
      .map(r => r.mpg!);

    const averageMPG = mpgValues.length > 0
      ? mpgValues.reduce((sum, mpg) => sum + mpg, 0) / mpgValues.length
      : 0;

    const bestMPG = mpgValues.length > 0 ? Math.max(...mpgValues) : 0;
    const worstMPG = mpgValues.length > 0 ? Math.min(...mpgValues) : 0;

    // Calculate total miles tracked
    const sortedByOdometer = [...records].sort((a, b) => a.odometer - b.odometer);
    const milesTracked = sortedByOdometer.length > 1
      ? sortedByOdometer[sortedByOdometer.length - 1].odometer - sortedByOdometer[0].odometer
      : 0;

    const averageCostPerGallon = totalGallons > 0 ? totalCost / totalGallons : 0;
    const averageCostPerMile = milesTracked > 0 ? totalCost / milesTracked : 0;

    return {
      totalFillUps,
      totalGallons,
      totalCost,
      averageMPG,
      averageCostPerGallon,
      averageCostPerMile,
      bestMPG,
      worstMPG,
      milesTracked,
    };
  }

  // Update vehicle's current mileage
  private static async updateVehicleMileage(
    vehicleId: string,
    newMileage: number
  ): Promise<void> {
    // Get current vehicle mileage
    const { data: vehicle } = await supabase
      .from('vehicles')
      .select('mileage')
      .eq('id', vehicleId)
      .single();

    // Only update if new mileage is higher
    if (!vehicle?.mileage || newMileage > vehicle.mileage) {
      await supabase
        .from('vehicles')
        .update({ mileage: newMileage })
        .eq('id', vehicleId);
    }
  }

  // Get recent stations for autocomplete
  static async getRecentStations(limit: number = 10): Promise<string[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data } = await supabase
      .from('fuel_records')
      .select('station_name')
      .eq('user_id', user.id)
      .not('station_name', 'is', null)
      .order('fill_date', { ascending: false })
      .limit(limit);

    if (!data) return [];

    // Get unique station names
    const uniqueStations = [...new Set(data.map(r => r.station_name!))];
    return uniqueStations;
  }
}
