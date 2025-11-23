// src/services/ExportService.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Vehicle } from '../types/Vehicle';
import { MaintenanceRecord } from '../types/Maintenance';
import { FuelRecordWithMPG, FuelStats } from '../types/Fuel';

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
}
