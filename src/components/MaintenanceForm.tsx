import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { MaintenanceService } from '../services/MaintenanceService';
import { VehicleService } from '../services/VehicleService';
import { PartsService } from '../services/PartsService';
import { MaintenanceRecord, SERVICE_TYPES } from '../types/Maintenance';
import { Vehicle } from '../types/Vehicle';
import { PartUsed } from '../types/Parts';
import { Toast } from './Toast';
import { PartsSelector } from './PartsSelector';
import { ImageUpload } from './ImageUpload';
import { useSettings } from '../contexts/SettingsContext';
import { getDistanceUnitLabel } from '../utils/unitConversions';

interface MaintenanceFormProps {
  vehicleId: string;
  onSuccess: () => void;
  existingRecord?: MaintenanceRecord;
  onCancel?: () => void;
}

export const MaintenanceForm = ({
  vehicleId,
  onSuccess,
  existingRecord,
  onCancel,
}: MaintenanceFormProps) => {
  const { settings } = useSettings();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<Partial<MaintenanceRecord>>({
    vehicle_id: vehicleId,
    service_type: existingRecord?.service_type || '',
    description: existingRecord?.description || '',
    service_date: existingRecord?.service_date || new Date().toISOString().split('T')[0],
    mileage: existingRecord?.mileage || undefined,
    cost: existingRecord?.cost || undefined,
    notes: existingRecord?.notes || '',
    parts_used: existingRecord?.parts_used || [],
    receipts: existingRecord?.receipts || [],
  });
  const [partsUsed, setPartsUsed] = useState<PartUsed[]>((existingRecord?.parts_used as PartUsed[]) || []);

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Fetch vehicle information
  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const vehicleData = await VehicleService.getVehicleById(vehicleId);
        setVehicle(vehicleData);
      } catch (error) {
        console.error('Failed to fetch vehicle:', error);
      }
    };
    fetchVehicle();
  }, [vehicleId]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'mileage'
          ? value
            ? parseInt(value)
            : undefined
          : name === 'cost'
          ? value
            ? parseFloat(value)
            : undefined
          : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.service_type || !formData.service_date) {
      setToast({ message: 'Please fill in required fields', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      // Add parts to formData
      const dataToSave = {
        ...formData,
        parts_used: partsUsed,
      };

      if (existingRecord) {
        await MaintenanceService.updateMaintenance(existingRecord.id, dataToSave);
        setToast({ message: 'Maintenance record updated!', type: 'success' });
      } else {
        await MaintenanceService.addMaintenance(dataToSave);
        setToast({ message: 'Maintenance record added!', type: 'success' });
      }

      // Add parts to community database (only for new parts)
      if (vehicle && partsUsed.length > 0) {
        for (const part of partsUsed) {
          try {
            await PartsService.addPart({
              make: vehicle.make,
              model: vehicle.model,
              year_start: vehicle.year - 2, // Allow 2 years before
              year_end: vehicle.year + 2, // Allow 2 years after
              service_type: formData.service_type!,
              part_type: part.type,
              part_number: part.number,
              brand: part.brand || null,
              notes: null,
            });
          } catch (error) {
            // Ignore duplicate errors (part already exists)
            console.log('Part may already exist:', error);
          }
        }
      }

      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error: any) {
      console.error(error);
      setToast({ message: error.message || 'Failed to save maintenance record', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <h3 className="text-xl font-bold text-gray-800">
          {existingRecord ? 'Edit Maintenance Record' : 'Add Maintenance Record'}
        </h3>

        {/* Service Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Type <span className="text-red-500">*</span>
          </label>
          <select
            name="service_type"
            value={formData.service_type}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select service type...</option>
            {SERVICE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <input
            type="text"
            name="description"
            placeholder="Brief description of work done"
            value={formData.description || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Service Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="service_date"
            value={formData.service_date}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Mileage & Cost */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {settings.distance_unit === 'kilometers' ? 'Odometer' : 'Mileage'} ({getDistanceUnitLabel(settings)}) (optional)
            </label>
            <input
              type="number"
              name="mileage"
              placeholder={`Current ${settings.distance_unit === 'kilometers' ? 'kilometers' : 'mileage'}`}
              value={formData.mileage || ''}
              onChange={handleChange}
              min="0"
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cost (optional)
            </label>
            <input
              type="number"
              name="cost"
              placeholder="0.00"
              value={formData.cost || ''}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            name="notes"
            placeholder="Additional notes or details..."
            value={formData.notes || ''}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Receipts/Documents Upload */}
        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Receipts & Documents
          </label>
          <ImageUpload
            currentImages={formData.receipts || []}
            onImagesChange={(urls) => setFormData(prev => ({ ...prev, receipts: urls }))}
            maxImages={5}
          />
          <p className="text-xs text-gray-500 mt-1">Upload receipts, invoices, or other documents (images or PDFs)</p>
        </div>

        {/* Parts Selector */}
        {vehicle && formData.service_type && (
          <div className="border-t pt-4">
            <PartsSelector
              vehicleMake={vehicle.make}
              vehicleModel={vehicle.model}
              vehicleYear={vehicle.year}
              serviceType={formData.service_type}
              onPartsChange={setPartsUsed}
              initialParts={partsUsed}
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className={`flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
            }`}
          >
            {loading ? 'Saving...' : existingRecord ? 'Update Record' : 'Add Record'}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </>
  );
};
