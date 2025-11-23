import { useState, ChangeEvent, FormEvent } from 'react';
import { VehicleService } from '../services/VehicleService';
import { VinDecoderService } from '../services/VinDecoderService';
import { Vehicle } from '../types/Vehicle';
import { Toast } from './Toast';
import { ImageUpload } from './ImageUpload';

interface VehicleFormProps {
  onAdd: () => void; // Callback to refresh inventory list
}

export const VehicleForm = ({ onAdd }: VehicleFormProps) => {
  const [vehicle, setVehicle] = useState<Partial<Vehicle>>({
    make: '',
    model: '',
    year: undefined,
    vin: '',
    license_plate: '',
    notes: '',
    image_url: '',
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [decodingVin, setDecodingVin] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setVehicle(prev => ({
      ...prev,
      [name]: name === 'year' ? (value ? Number(value) : undefined) : value,
    }));
  };

  const handleDecodeVin = async () => {
    if (!vehicle.vin) {
      setToast({ message: 'Please enter a VIN first', type: 'error' });
      return;
    }

    if (!VinDecoderService.isValidVinFormat(vehicle.vin)) {
      setToast({ message: 'Invalid VIN format. VIN must be 17 characters.', type: 'error' });
      return;
    }

    setDecodingVin(true);
    try {
      const decoded = await VinDecoderService.decodeVin(vehicle.vin);
      setVehicle(prev => ({
        ...prev,
        make: decoded.make,
        model: decoded.model,
        year: decoded.year,
      }));
      setToast({ message: 'VIN decoded successfully!', type: 'success' });
    } catch (err: any) {
      console.error(err);
      setToast({ message: err.message || 'Failed to decode VIN', type: 'error' });
    } finally {
      setDecodingVin(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await VehicleService.addVehicle(vehicle);
      // Reset form
      setVehicle({ make: '', model: '', year: undefined, vin: '', license_plate: '', notes: '', image_url: '' });
      setToast({ message: 'Vehicle added successfully!', type: 'success' });
      onAdd(); // Refresh inventory
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to add vehicle. Please try again.', type: 'error' });
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
      <input
        name="make"
        placeholder="Make"
        value={vehicle.make || ''}
        onChange={handleChange}
        required
        className="w-full border p-2 rounded"
      />
      <input
        name="model"
        placeholder="Model"
        value={vehicle.model || ''}
        onChange={handleChange}
        required
        className="w-full border p-2 rounded"
      />
      <input
        name="year"
        placeholder="Year"
        type="number"
        value={vehicle.year ?? ''}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      {/* VIN Input with Decode Button */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            name="vin"
            placeholder="VIN (17 characters)"
            value={vehicle.vin || ''}
            onChange={handleChange}
            maxLength={17}
            className="flex-1 border p-2 rounded"
          />
          <button
            type="button"
            onClick={handleDecodeVin}
            disabled={decodingVin || !vehicle.vin || vehicle.vin.length !== 17}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {decodingVin ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Decoding...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Decode VIN
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500">Enter a 17-character VIN and click "Decode VIN" to auto-fill vehicle details</p>
      </div>

      <input
        name="license_plate"
        placeholder="License Plate (optional)"
        value={vehicle.license_plate || ''}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />
      <textarea
        name="notes"
        placeholder="Notes"
        value={vehicle.notes || ''}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Vehicle Photo
        </label>
        <ImageUpload
          currentImageUrl={vehicle.image_url}
          onImageUpload={(url) => setVehicle(prev => ({ ...prev, image_url: url }))}
          onImageRemove={() => setVehicle(prev => ({ ...prev, image_url: '' }))}
        />
      </div>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Add Vehicle
      </button>
    </form>
    </>
  );
};
