import { useState, ChangeEvent, FormEvent } from 'react';
import { VehicleService } from '../services/VehicleService';
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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setVehicle(prev => ({
      ...prev,
      [name]: name === 'year' ? (value ? Number(value) : undefined) : value,
    }));
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
      <input
        name="vin"
        placeholder="VIN (optional)"
        value={vehicle.vin || ''}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />
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
