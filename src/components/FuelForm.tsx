// src/components/FuelForm.tsx
import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { FuelService } from '../services/FuelService';
import { FuelRecord, FUEL_GRADES, TRIP_TYPES } from '../types/Fuel';
import { Toast } from './Toast';

interface FuelFormProps {
  vehicleId: string;
  onSuccess: () => void;
  existingRecord?: FuelRecord;
  onCancel?: () => void;
  currentMileage?: number; // To prefill odometer
}

export const FuelForm = ({
  vehicleId,
  onSuccess,
  existingRecord,
  onCancel,
  currentMileage,
}: FuelFormProps) => {
  const [formData, setFormData] = useState<Partial<FuelRecord>>({
    vehicle_id: vehicleId,
    fill_date: existingRecord?.fill_date || new Date().toISOString().split('T')[0],
    odometer: existingRecord?.odometer || currentMileage || undefined,
    gallons: existingRecord?.gallons || undefined,
    price_per_gallon: existingRecord?.price_per_gallon || undefined,
    total_cost: existingRecord?.total_cost || undefined,
    station_name: existingRecord?.station_name || '',
    location: existingRecord?.location || '',
    fuel_grade: existingRecord?.fuel_grade || 'Regular',
    trip_type: existingRecord?.trip_type || 'Personal',
    partial_fill: existingRecord?.partial_fill || false,
    notes: existingRecord?.notes || '',
  });

  const [recentStations, setRecentStations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    // Fetch recent stations for autocomplete
    const fetchStations = async () => {
      const stations = await FuelService.getRecentStations();
      setRecentStations(stations);
    };
    fetchStations();
  }, []);

  // Auto-calculate total cost when gallons or price changes
  useEffect(() => {
    if (formData.gallons && formData.price_per_gallon) {
      const calculated = formData.gallons * formData.price_per_gallon;
      setFormData(prev => ({ ...prev, total_cost: parseFloat(calculated.toFixed(2)) }));
    }
  }, [formData.gallons, formData.price_per_gallon]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : name === 'odometer'
          ? value ? parseInt(value) : undefined
          : name === 'gallons' || name === 'price_per_gallon' || name === 'total_cost'
          ? value ? parseFloat(value) : undefined
          : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.fill_date || !formData.odometer || !formData.gallons) {
      setToast({ message: 'Please fill in required fields', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      if (existingRecord) {
        await FuelService.updateFuelRecord(existingRecord.id, formData);
        setToast({ message: 'Fuel record updated!', type: 'success' });
      } else {
        await FuelService.addFuelRecord(formData);
        setToast({ message: 'Fuel record added!', type: 'success' });
      }

      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error: any) {
      console.error(error);
      setToast({ message: error.message || 'Failed to save fuel record', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <h3 className="text-xl font-bold text-gray-800">
          {existingRecord ? 'Edit Fuel Record' : 'Add Fuel Record'}
        </h3>

        {/* Fill Date & Odometer */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fill Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="fill_date"
              value={formData.fill_date}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Odometer <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="odometer"
              placeholder="Current mileage"
              value={formData.odometer || ''}
              onChange={handleChange}
              required
              min="0"
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Gallons & Price per Gallon */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gallons <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="gallons"
              placeholder="0.000"
              value={formData.gallons || ''}
              onChange={handleChange}
              required
              min="0"
              step="0.001"
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price per Gallon
            </label>
            <input
              type="number"
              name="price_per_gallon"
              placeholder="0.000"
              value={formData.price_per_gallon || ''}
              onChange={handleChange}
              min="0"
              step="0.001"
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Total Cost (auto-calculated) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Cost
          </label>
          <input
            type="number"
            name="total_cost"
            placeholder="0.00"
            value={formData.total_cost || ''}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
          <p className="text-xs text-gray-500 mt-1">Auto-calculated from gallons × price</p>
        </div>

        {/* Station Name & Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Station Name
            </label>
            <input
              type="text"
              name="station_name"
              placeholder="Shell, BP, etc."
              value={formData.station_name || ''}
              onChange={handleChange}
              list="stations"
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <datalist id="stations">
              {recentStations.map((station, idx) => (
                <option key={idx} value={station} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              placeholder="City or address"
              value={formData.location || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Fuel Grade & Trip Type */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fuel Grade
            </label>
            <select
              name="fuel_grade"
              value={formData.fuel_grade}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {FUEL_GRADES.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trip Type
            </label>
            <select
              name="trip_type"
              value={formData.trip_type}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TRIP_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Partial Fill Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="partial_fill"
            checked={formData.partial_fill}
            onChange={handleChange}
            className="mr-2"
            id="partial_fill"
          />
          <label htmlFor="partial_fill" className="text-sm text-gray-700">
            Partial fill (tank not filled completely)
          </label>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            name="notes"
            placeholder="Additional notes..."
            value={formData.notes || ''}
            onChange={handleChange}
            rows={2}
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

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
