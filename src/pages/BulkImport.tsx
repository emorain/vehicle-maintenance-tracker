import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { downloadTemplate, parseExcelFile, validateVehicle, VehicleImportRow } from '../utils/excelTemplate';
import { Toast } from '../components/Toast';

interface ValidationResult {
  rowIndex: number;
  vehicle: VehicleImportRow;
  valid: boolean;
  errors: string[];
}

export const BulkImport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<VehicleImportRow[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [importing, setImporting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const navigate = useNavigate();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check file type
    if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
      setToast({ message: 'Please select an Excel file (.xlsx or .xls)', type: 'error' });
      return;
    }

    setFile(selectedFile);

    try {
      // Parse the file
      const vehicles = await parseExcelFile(selectedFile);

      if (vehicles.length === 0) {
        setToast({ message: 'No data found in file. Please check the format.', type: 'error' });
        return;
      }

      setParsedData(vehicles);

      // Validate all rows
      const results: ValidationResult[] = vehicles.map((vehicle, index) => {
        const validation = validateVehicle(vehicle);
        return {
          rowIndex: index + 1,
          vehicle,
          ...validation,
        };
      });

      setValidationResults(results);

      const validCount = results.filter(r => r.valid).length;
      const invalidCount = results.length - validCount;

      if (invalidCount > 0) {
        setToast({
          message: `Parsed ${results.length} rows: ${validCount} valid, ${invalidCount} invalid. Fix errors before importing.`,
          type: 'info'
        });
      } else {
        setToast({
          message: `Successfully parsed ${validCount} vehicles. Ready to import!`,
          type: 'success'
        });
      }
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : 'Failed to parse file',
        type: 'error'
      });
    }
  };

  const handleImport = async () => {
    const validVehicles = validationResults.filter(r => r.valid);

    if (validVehicles.length === 0) {
      setToast({ message: 'No valid vehicles to import', type: 'error' });
      return;
    }

    setImporting(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setToast({ message: 'You must be logged in to import vehicles', type: 'error' });
        setImporting(false);
        return;
      }

      // Prepare vehicles for insert
      const vehiclesToInsert = validVehicles.map(r => ({
        ...r.vehicle,
        user_id: user.id,
        created_at: new Date().toISOString(),
      }));

      // Bulk insert in chunks of 100 to avoid timeouts
      const chunkSize = 100;
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < vehiclesToInsert.length; i += chunkSize) {
        const chunk = vehiclesToInsert.slice(i, i + chunkSize);

        const { error } = await supabase
          .from('vehicles')
          .insert(chunk);

        if (error) {
          console.error('Error inserting chunk:', error);
          errorCount += chunk.length;
        } else {
          successCount += chunk.length;
        }
      }

      setImporting(false);

      if (errorCount > 0) {
        setToast({
          message: `Import completed: ${successCount} successful, ${errorCount} failed`,
          type: 'info'
        });
      } else {
        setToast({
          message: `Successfully imported ${successCount} vehicles!`,
          type: 'success'
        });

        // Reset state and redirect after success
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      setImporting(false);
      setToast({
        message: error instanceof Error ? error.message : 'Failed to import vehicles',
        type: 'error'
      });
    }
  };

  const validCount = validationResults.filter(r => r.valid).length;
  const invalidCount = validationResults.length - validCount;

  return (
    <div className="max-w-7xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Bulk Vehicle Import</h1>
        <p className="text-gray-600 mt-2">Import multiple vehicles at once using an Excel spreadsheet</p>
      </div>

      {/* Step 1: Download Template */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">1</span>
          Download Template
        </h2>
        <p className="text-gray-600 mb-4">
          Download the Excel template, fill it out with your vehicle data, and save the file.
        </p>
        <button
          onClick={downloadTemplate}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold"
        >
          📥 Download Template
        </button>
      </div>

      {/* Step 2: Upload File */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">2</span>
          Upload File
        </h2>
        <p className="text-gray-600 mb-4">
          Select the completed Excel file to upload and preview the data.
        </p>
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            cursor-pointer"
        />
        {file && (
          <p className="mt-2 text-sm text-gray-600">
            Selected: <span className="font-semibold">{file.name}</span>
          </p>
        )}
      </div>

      {/* Step 3: Preview & Validate */}
      {validationResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">3</span>
            Preview & Validate
          </h2>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Total Rows</p>
              <p className="text-2xl font-bold text-gray-800">{validationResults.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Valid</p>
              <p className="text-2xl font-bold text-green-600">{validCount}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-gray-600 text-sm">Invalid</p>
              <p className="text-2xl font-bold text-red-600">{invalidCount}</p>
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto max-h-96 overflow-y-auto border rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Row</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Make</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">VIN</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">License</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Errors</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {validationResults.map((result) => (
                  <tr key={result.rowIndex} className={result.valid ? 'bg-white' : 'bg-red-50'}>
                    <td className="px-4 py-3 text-sm text-gray-900">{result.rowIndex}</td>
                    <td className="px-4 py-3 text-sm">
                      {result.valid ? (
                        <span className="text-green-600 font-semibold">✓</span>
                      ) : (
                        <span className="text-red-600 font-semibold">✗</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{result.vehicle.make}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{result.vehicle.model}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{result.vehicle.year}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-mono text-xs">{result.vehicle.vin}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{result.vehicle.license_plate}</td>
                    <td className="px-4 py-3 text-sm text-red-600">
                      {result.errors.length > 0 && (
                        <ul className="list-disc list-inside">
                          {result.errors.map((error, i) => (
                            <li key={i} className="text-xs">{error}</li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Step 4: Import */}
      {validCount > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">4</span>
            Import Vehicles
          </h2>
          <p className="text-gray-600 mb-4">
            {invalidCount > 0 ? (
              <span className="text-orange-600">
                ⚠️ {invalidCount} invalid row(s) will be skipped. Only {validCount} valid vehicle(s) will be imported.
              </span>
            ) : (
              <span className="text-green-600">
                ✓ All {validCount} vehicle(s) are valid and ready to import!
              </span>
            )}
          </p>
          <div className="flex gap-4">
            <button
              onClick={handleImport}
              disabled={importing}
              className={`px-6 py-3 rounded-lg font-semibold ${
                importing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {importing ? 'Importing...' : `Import ${validCount} Vehicle(s)`}
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-lg font-semibold bg-gray-200 hover:bg-gray-300 text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
