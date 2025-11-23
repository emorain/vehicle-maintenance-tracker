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
    engine: '',
    notes: '',
    images: [],
    drive_type: '',
    tire_size: '',
    trim: '',
    body_type: '',
    transmission: '',
    fuel_type: '',
    optional_equipment: [],
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [decodingVin, setDecodingVin] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

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
        engine: decoded.engineType || prev.engine,
        trim: decoded.trim || prev.trim,
        body_type: decoded.bodyClass || prev.body_type,
        transmission: decoded.transmission || prev.transmission,
        drive_type: decoded.driveType || prev.drive_type,
        fuel_type: decoded.fuelType || prev.fuel_type,
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
      setVehicle({
        make: '',
        model: '',
        year: undefined,
        vin: '',
        license_plate: '',
        engine: '',
        notes: '',
        images: [],
        drive_type: '',
        tire_size: '',
        trim: '',
        body_type: '',
        transmission: '',
        fuel_type: '',
        optional_equipment: [],
      });
      setShowAdvanced(false);
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
      <input
        name="engine"
        placeholder="Engine (optional, e.g., 2.0L 4-Cylinder)"
        value={vehicle.engine || ''}
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />

      {/* Drive Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Drive Type</label>
        <select
          name="drive_type"
          value={vehicle.drive_type || ''}
          onChange={(e) => setVehicle(prev => ({ ...prev, drive_type: e.target.value }))}
          className="w-full border p-2 rounded"
        >
          <option value="">Select Drive Type (optional)</option>
          <option value="2WD">2WD (Two-Wheel Drive)</option>
          <option value="FWD">FWD (Front-Wheel Drive)</option>
          <option value="RWD">RWD (Rear-Wheel Drive)</option>
          <option value="AWD">AWD (All-Wheel Drive)</option>
          <option value="4WD">4WD (Four-Wheel Drive)</option>
        </select>
      </div>

      {/* Tire Size */}
      <input
        name="tire_size"
        placeholder="Tire Size (optional, e.g., 225/65R17)"
        value={vehicle.tire_size || ''}
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
          Vehicle Photos
        </label>
        <ImageUpload
          currentImages={vehicle.images || []}
          onImagesChange={(urls) => setVehicle(prev => ({ ...prev, images: urls }))}
          maxImages={10}
        />
      </div>

      {/* Advanced Details - Expandable Section */}
      <div className="border-t pt-4">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between bg-gray-100 hover:bg-gray-200 px-4 py-3 rounded-lg font-medium text-gray-700 transition"
        >
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Advanced Vehicle Details
          </span>
          <svg
            className={`w-5 h-5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4 bg-gray-50 p-4 rounded-lg">
            {/* Trim & Specifications */}
            <div className="grid grid-cols-2 gap-3">
              <input
                name="trim"
                placeholder="Trim (e.g., LT, Sport, Limited)"
                value={vehicle.trim || ''}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              <select
                name="body_type"
                value={vehicle.body_type || ''}
                onChange={(e) => setVehicle(prev => ({ ...prev, body_type: e.target.value }))}
                className="border p-2 rounded"
              >
                <option value="">Body Type (optional)</option>
                <option value="Sedan">Sedan</option>
                <option value="Coupe">Coupe</option>
                <option value="SUV">SUV</option>
                <option value="Truck">Truck</option>
                <option value="Van">Van</option>
                <option value="Wagon">Wagon</option>
                <option value="Convertible">Convertible</option>
                <option value="Hatchback">Hatchback</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                name="transmission"
                placeholder="Transmission (e.g., Automatic, Manual)"
                value={vehicle.transmission || ''}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              <select
                name="fuel_type"
                value={vehicle.fuel_type || ''}
                onChange={(e) => setVehicle(prev => ({ ...prev, fuel_type: e.target.value }))}
                className="border p-2 rounded"
              >
                <option value="">Fuel Type (optional)</option>
                <option value="Gasoline">Gasoline</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Plug-in Hybrid">Plug-in Hybrid</option>
                <option value="Flex Fuel">Flex Fuel (E85)</option>
              </select>
            </div>

            {/* Optional Equipment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Optional Equipment</label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  'Leather Seats',
                  'Heated Seats',
                  'Cooled Seats',
                  'Sunroof',
                  'Moonroof',
                  'Navigation System',
                  'Backup Camera',
                  'Blind Spot Monitoring',
                  'Adaptive Cruise Control',
                  'Parking Sensors',
                  'Premium Audio',
                  'Roof Rack',
                  'Running Boards',
                  'Towing Package',
                  'Bed Liner',
                  'Third Row Seating',
                  'Power Liftgate',
                  'Sport Suspension',
                ].map((equipment) => (
                  <label key={equipment} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={vehicle.optional_equipment?.includes(equipment) || false}
                      onChange={(e) => {
                        const current = vehicle.optional_equipment || [];
                        const updated = e.target.checked
                          ? [...current, equipment]
                          : current.filter(item => item !== equipment);
                        setVehicle(prev => ({ ...prev, optional_equipment: updated }));
                      }}
                      className="rounded"
                    />
                    <span>{equipment}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Purchase Information */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Purchase Information</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={vehicle.purchase_date || ''}
                    onChange={(e) => setVehicle(prev => ({ ...prev, purchase_date: e.target.value }))}
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Purchase Price</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={vehicle.purchase_price || ''}
                    onChange={(e) => setVehicle(prev => ({ ...prev, purchase_price: e.target.value ? Number(e.target.value) : undefined }))}
                    className="w-full border p-2 rounded"
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs text-gray-600 mb-1">Warranty Expiration</label>
                <input
                  type="date"
                  value={vehicle.warranty_expiration || ''}
                  onChange={(e) => setVehicle(prev => ({ ...prev, warranty_expiration: e.target.value }))}
                  className="w-full border p-2 rounded"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Add Vehicle
      </button>
    </form>
    </>
  );
};
