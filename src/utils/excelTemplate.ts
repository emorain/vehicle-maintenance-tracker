import * as XLSX from 'xlsx';

export interface VehicleImportRow {
  make: string;
  model: string;
  year: number;
  vin: string;
  license_plate: string;
  mileage?: number;
  status?: string;
  vehicle_type?: string;
  engine?: string;
  transmission?: string;
  fuel_type?: string;
  drive_type?: string;
  body_type?: string;
  tire_size?: string;
  trim?: string;
  purchase_date?: string;
  purchase_price?: number;
}

export const TEMPLATE_COLUMNS = [
  { key: 'make', label: 'Make*', example: 'Toyota' },
  { key: 'model', label: 'Model*', example: 'Camry' },
  { key: 'year', label: 'Year*', example: '2020' },
  { key: 'vin', label: 'VIN*', example: '1HGBH41JXMN109186' },
  { key: 'license_plate', label: 'License Plate*', example: 'ABC-1234' },
  { key: 'mileage', label: 'Mileage', example: '45000' },
  { key: 'status', label: 'Status', example: 'Active' },
  { key: 'vehicle_type', label: 'Vehicle Type', example: 'Sedan' },
  { key: 'engine', label: 'Engine', example: '2.5L I4' },
  { key: 'transmission', label: 'Transmission', example: 'Automatic' },
  { key: 'fuel_type', label: 'Fuel Type', example: 'Gasoline' },
  { key: 'drive_type', label: 'Drive Type', example: 'FWD' },
  { key: 'body_type', label: 'Body Type', example: 'Sedan' },
  { key: 'tire_size', label: 'Tire Size', example: '215/55R17' },
  { key: 'trim', label: 'Trim', example: 'LE' },
  { key: 'purchase_date', label: 'Purchase Date', example: '2020-01-15' },
  { key: 'purchase_price', label: 'Purchase Price', example: '25000' },
];

/**
 * Generate and download Excel template for vehicle bulk import
 */
export const downloadTemplate = () => {
  // Create workbook
  const wb = XLSX.utils.book_new();

  // Create worksheet data
  const headers = TEMPLATE_COLUMNS.map(col => col.label);
  const exampleRow = TEMPLATE_COLUMNS.map(col => col.example);
  const instructionsRow = [
    'Fields marked with * are required',
    'Delete this row and example row before importing',
    'Date format: YYYY-MM-DD',
    'Status options: Active, Inactive, In Service, Sold',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    ''
  ];

  const wsData = [
    instructionsRow,
    headers,
    exampleRow,
  ];

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = TEMPLATE_COLUMNS.map(() => ({ wch: 15 }));

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Vehicle Import Template');

  // Generate file and trigger download
  XLSX.writeFile(wb, 'vehicle_import_template.xlsx');
};

/**
 * Parse uploaded Excel file and return vehicle data
 */
export const parseExcelFile = (file: File): Promise<VehicleImportRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

        // Map to our vehicle structure
        const vehicles: VehicleImportRow[] = jsonData.map((row: any) => {
          // Handle different possible column name formats
          const getValue = (key: string) => {
            // Try exact match first
            if (row[key] !== undefined) return row[key];

            // Try with * suffix (required fields)
            if (row[`${key}*`] !== undefined) return row[`${key}*`];

            // Try label format
            const column = TEMPLATE_COLUMNS.find(c => c.key === key);
            if (column && row[column.label] !== undefined) return row[column.label];

            return undefined;
          };

          return {
            make: getValue('Make') || getValue('make') || '',
            model: getValue('Model') || getValue('model') || '',
            year: parseInt(getValue('Year') || getValue('year') || '0'),
            vin: getValue('VIN') || getValue('vin') || '',
            license_plate: getValue('License Plate') || getValue('license_plate') || '',
            mileage: getValue('Mileage') || getValue('mileage') ? parseInt(getValue('Mileage') || getValue('mileage')) : undefined,
            status: getValue('Status') || getValue('status') || 'Active',
            vehicle_type: getValue('Vehicle Type') || getValue('vehicle_type'),
            engine: getValue('Engine') || getValue('engine'),
            transmission: getValue('Transmission') || getValue('transmission'),
            fuel_type: getValue('Fuel Type') || getValue('fuel_type'),
            drive_type: getValue('Drive Type') || getValue('drive_type'),
            body_type: getValue('Body Type') || getValue('body_type'),
            tire_size: getValue('Tire Size') || getValue('tire_size'),
            trim: getValue('Trim') || getValue('trim'),
            purchase_date: getValue('Purchase Date') || getValue('purchase_date'),
            purchase_price: getValue('Purchase Price') || getValue('purchase_price') ? parseFloat(getValue('Purchase Price') || getValue('purchase_price')) : undefined,
          };
        });

        resolve(vehicles);
      } catch (error) {
        reject(new Error('Failed to parse Excel file. Please check the format.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsBinaryString(file);
  });
};

/**
 * Validate a vehicle row
 */
export const validateVehicle = (vehicle: VehicleImportRow): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Required fields
  if (!vehicle.make?.trim()) errors.push('Make is required');
  if (!vehicle.model?.trim()) errors.push('Model is required');
  if (!vehicle.year || vehicle.year < 1900 || vehicle.year > new Date().getFullYear() + 1) {
    errors.push('Valid year is required');
  }
  if (!vehicle.vin?.trim()) errors.push('VIN is required');
  if (!vehicle.license_plate?.trim()) errors.push('License plate is required');

  // Optional field validations
  if (vehicle.status && !['Active', 'Inactive', 'In Service', 'Sold'].includes(vehicle.status)) {
    errors.push('Status must be: Active, Inactive, In Service, or Sold');
  }

  if (vehicle.mileage !== undefined && (vehicle.mileage < 0 || isNaN(vehicle.mileage))) {
    errors.push('Mileage must be a positive number');
  }

  if (vehicle.purchase_price !== undefined && (vehicle.purchase_price < 0 || isNaN(vehicle.purchase_price))) {
    errors.push('Purchase price must be a positive number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
