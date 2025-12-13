// src/services/ExportService.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Vehicle } from '../types/Vehicle';
import { MaintenanceRecord } from '../types/Maintenance';
import { FuelRecordWithMPG, FuelStats } from '../types/Fuel';
import { supabase } from '../lib/supabaseClient';
import { VehicleService } from './VehicleService';
import { MaintenanceService } from './MaintenanceService';
import { FuelService } from './FuelService';
import { ProtocolService } from './ProtocolService';

export interface BackupData {
  exportDate: string;
  vehicles: any[];
  maintenanceRecords: any[];
  fuelRecords: any[];
  protocols: any[];
  vehicleProtocols: any[];
  userSettings: any;
}

export class ExportService {
  static exportMaintenanceHistory(
    vehicle: Vehicle,
    maintenanceRecords: MaintenanceRecord[],
    fuelRecords?: FuelRecordWithMPG[],
    fuelStats?: FuelStats
  ): void {
    const doc = new jsPDF();
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Vehicle Maintenance History', 105, yPosition, { align: 'center' });
    yPosition += 15;

    // Vehicle Information Section
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Vehicle Information', 14, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const vehicleInfo = [
      ['Make:', vehicle.make],
      ['Model:', vehicle.model],
      ['Year:', vehicle.year.toString()],
    ];

    if (vehicle.vin) vehicleInfo.push(['VIN:', vehicle.vin]);
    if (vehicle.license_plate) vehicleInfo.push(['License Plate:', vehicle.license_plate]);
    if (vehicle.color) vehicleInfo.push(['Color:', vehicle.color]);
    if (vehicle.mileage) vehicleInfo.push(['Current Mileage:', vehicle.mileage.toLocaleString() + ' mi']);
    if (vehicle.engine) vehicleInfo.push(['Engine:', vehicle.engine]);

    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: vehicleInfo,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 'auto' }
      },
      margin: { left: 14 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Maintenance Summary
    if (maintenanceRecords.length > 0) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Maintenance Summary', 14, yPosition);
      yPosition += 8;

      const totalCost = maintenanceRecords.reduce((sum, r) => sum + (r.cost || 0), 0);
      const totalRecords = maintenanceRecords.length;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Records: ${totalRecords}`, 14, yPosition);
      yPosition += 6;
      doc.text(`Total Spent: $${totalCost.toFixed(2)}`, 14, yPosition);
      yPosition += 10;

      // Maintenance Records Table
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Maintenance Records', 14, yPosition);
      yPosition += 6;

      const maintenanceData = maintenanceRecords
        .sort((a, b) => new Date(b.service_date).getTime() - new Date(a.service_date).getTime())
        .map(record => [
          new Date(record.service_date).toLocaleDateString(),
          record.service_type,
          record.mileage ? record.mileage.toLocaleString() : 'N/A',
          record.cost ? `$${record.cost.toFixed(2)}` : 'N/A',
          record.description || '',
        ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Date', 'Service Type', 'Mileage', 'Cost', 'Description']],
        body: maintenanceData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246], fontSize: 9 },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 40 },
          2: { cellWidth: 20 },
          3: { cellWidth: 20 },
          4: { cellWidth: 'auto' }
        },
        margin: { left: 14, right: 14 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Fuel Statistics (if provided)
    if (fuelStats && fuelRecords && fuelRecords.length > 0) {
      // Add new page if needed
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Fuel Statistics', 14, yPosition);
      yPosition += 8;

      const fuelInfo = [
        ['Total Fill-Ups:', fuelStats.totalFillUps.toString()],
        ['Total Gallons:', fuelStats.totalGallons.toFixed(1)],
        ['Total Fuel Cost:', `$${fuelStats.totalCost.toFixed(2)}`],
        ['Miles Tracked:', fuelStats.milesTracked.toLocaleString()],
        ['Average MPG:', fuelStats.averageMPG > 0 ? fuelStats.averageMPG.toFixed(1) : 'N/A'],
        ['Best MPG:', fuelStats.bestMPG > 0 ? fuelStats.bestMPG.toFixed(1) : 'N/A'],
        ['Worst MPG:', fuelStats.worstMPG > 0 ? fuelStats.worstMPG.toFixed(1) : 'N/A'],
        ['Avg Cost/Gallon:', `$${fuelStats.averageCostPerGallon.toFixed(3)}`],
        ['Avg Cost/Mile:', `$${fuelStats.averageCostPerMile.toFixed(3)}`],
      ];

      autoTable(doc, {
        startY: yPosition,
        head: [],
        body: fuelInfo,
        theme: 'plain',
        styles: { fontSize: 10 },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 50 },
          1: { cellWidth: 'auto' }
        },
        margin: { left: 14 }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`,
        105,
        285,
        { align: 'center' }
      );
      doc.text('Exported from Vehicle Maintenance Tracker', 105, 290, { align: 'center' });
    }

    // Save the PDF
    const fileName = `${vehicle.year}_${vehicle.make}_${vehicle.model}_maintenance_history.pdf`
      .replace(/\s+/g, '_')
      .toLowerCase();
    doc.save(fileName);
  }

  /**
   * Export all user data to JSON format for backup
   */
  static async exportAllData(): Promise<BackupData> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('You must be logged in to export data');
      }

      // Fetch all data in parallel
      const [vehicles, protocols, vehicleProtocols, userSettings] = await Promise.all([
        VehicleService.getVehicles(),
        ProtocolService.getAllProtocols(),
        supabase.from('vehicle_protocols').select('*').eq('user_id', user.id),
        supabase.from('user_settings').select('*').eq('user_id', user.id).single(),
      ]);

      // Fetch maintenance and fuel records for all vehicles
      const maintenanceRecords: any[] = [];
      const fuelRecords: any[] = [];

      for (const vehicle of vehicles) {
        const [maintenance, fuel] = await Promise.all([
          MaintenanceService.getMaintenanceByVehicle(vehicle.id),
          FuelService.getFuelRecords(vehicle.id),
        ]);
        maintenanceRecords.push(...maintenance);
        fuelRecords.push(...fuel);
      }

      const backupData: BackupData = {
        exportDate: new Date().toISOString(),
        vehicles,
        maintenanceRecords,
        fuelRecords,
        protocols,
        vehicleProtocols: vehicleProtocols.data || [],
        userSettings: userSettings.data || {},
      };

      return backupData;
    } catch (error: any) {
      console.error('Export error:', error);
      throw new Error(error.message || 'Failed to export data');
    }
  }

  /**
   * Download complete backup as JSON file
   */
  static async downloadBackup(): Promise<void> {
    const data = await this.exportAllData();

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `upshift-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Export vehicles data as CSV
   */
  static async exportVehiclesToCSV(): Promise<void> {
    const vehicles = await VehicleService.getVehicles();

    const headers = [
      'ID', 'Make', 'Model', 'Year', 'VIN', 'License Plate', 'Color',
      'Odometer', 'Status', 'Drive Type', 'Tire Size', 'Trim', 'Body Type',
      'Transmission', 'Fuel Type', 'Warranty Expiration', 'Notes', 'Created At'
    ];

    const rows = vehicles.map(v => [
      v.id,
      v.make,
      v.model,
      v.year,
      v.vin || '',
      v.license_plate || '',
      v.color || '',
      v.mileage || '',
      v.status || 'Active',
      v.drive_type || '',
      v.tire_size || '',
      v.trim || '',
      v.body_type || '',
      v.transmission || '',
      v.fuel_type || '',
      v.warranty_expiration || '',
      v.notes || '',
      v.created_at || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vehicles-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Export maintenance records as CSV
   */
  static async exportMaintenanceToCSV(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const vehicles = await VehicleService.getVehicles();
    const allRecords: any[] = [];

    for (const vehicle of vehicles) {
      const records = await MaintenanceService.getMaintenanceByVehicle(vehicle.id);
      records.forEach(record => {
        allRecords.push({
          ...record,
          vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`
        });
      });
    }

    const headers = [
      'Vehicle', 'Service Type', 'Description', 'Service Date', 'Odometer',
      'Cost', 'Notes', 'Created At'
    ];

    const rows = allRecords.map(r => [
      r.vehicle,
      r.service_type,
      r.description || '',
      r.service_date,
      r.mileage || '',
      r.cost || '',
      r.notes || '',
      r.created_at || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `maintenance-records-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Export fuel records as CSV
   */
  static async exportFuelToCSV(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const vehicles = await VehicleService.getVehicles();
    const allRecords: any[] = [];

    for (const vehicle of vehicles) {
      const records = await FuelService.getFuelRecords(vehicle.id);
      records.forEach((record: any) => {
        allRecords.push({
          ...record,
          vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`
        });
      });
    }

    const headers = [
      'Vehicle', 'Fill Date', 'Odometer', 'Gallons', 'Cost Per Gallon',
      'Total Cost', 'Miles Driven', 'MPG', 'Station', 'Notes', 'Created At'
    ];

    const rows = allRecords.map(r => [
      r.vehicle,
      r.fill_date,
      r.odometer || '',
      r.gallons || '',
      r.price_per_gallon || '',
      r.total_cost || '',
      r.miles_driven || '',
      r.mpg || '',
      r.gas_station || '',
      r.notes || '',
      r.created_at || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fuel-records-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
