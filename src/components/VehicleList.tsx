// src/components/VehicleList.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { VehicleService } from '../services/VehicleService';
import { Vehicle } from '../types/Vehicle';
import { Toast } from './Toast';
import { ConfirmModal } from './ConfirmModal';
import { ImageUpload } from './ImageUpload';

interface VehicleListProps {
  refreshKey?: number;
}

export const VehicleList = ({ refreshKey }: VehicleListProps) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Vehicle>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await VehicleService.getVehicles();
      setVehicles(data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load vehicles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [refreshKey]);

  const handleDelete = async (id: string) => {
    try {
      await VehicleService.deleteVehicle(id);
      setVehicles(vehicles.filter(v => v.id !== id));
      setToast({ message: 'Vehicle deleted successfully', type: 'success' });
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to delete vehicle', type: 'error' });
      setDeleteConfirm(null);
    }
  };

  const startEdit = (vehicle: Vehicle) => {
    setEditingId(vehicle.id);
    setEditForm({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      vin: vehicle.vin,
      license_plate: vehicle.license_plate,
      color: vehicle.color,
      mileage: vehicle.mileage,
      notes: vehicle.notes,
      images: vehicle.images,
      drive_type: vehicle.drive_type,
      tire_size: vehicle.tire_size,
      trim: vehicle.trim,
      body_type: vehicle.body_type,
      transmission: vehicle.transmission,
      fuel_type: vehicle.fuel_type,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleUpdate = async (id: string) => {
    try {
      const updated = await VehicleService.updateVehicle(id, editForm);
      setVehicles(vehicles.map(v => v.id === id ? updated : v));
      setEditingId(null);
      setEditForm({});
      setToast({ message: 'Vehicle updated successfully', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to update vehicle', type: 'error' });
    }
  };

  if (loading) return <p>Loading vehicles...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (vehicles.length === 0) return <p>No vehicles in inventory yet.</p>;

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {deleteConfirm && (
        <ConfirmModal
          title="Delete Vehicle"
          message="Are you sure you want to delete this vehicle? This action cannot be undone."
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
      <div className="space-y-4 mt-6">
      {vehicles.map(vehicle => (
        <div key={vehicle.id} className="border p-4 rounded shadow bg-white">
          {editingId === vehicle.id ? (
            // Edit Mode
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={editForm.make || ''}
                  onChange={(e) => setEditForm({ ...editForm, make: e.target.value })}
                  placeholder="Make"
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  value={editForm.model || ''}
                  onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                  placeholder="Model"
                  className="border p-2 rounded"
                />
                <input
                  type="number"
                  value={editForm.year || ''}
                  onChange={(e) => setEditForm({ ...editForm, year: Number(e.target.value) })}
                  placeholder="Year"
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  value={editForm.license_plate || ''}
                  onChange={(e) => setEditForm({ ...editForm, license_plate: e.target.value })}
                  placeholder="License Plate"
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  value={editForm.color || ''}
                  onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                  placeholder="Color"
                  className="border p-2 rounded"
                />
                <input
                  type="number"
                  value={editForm.mileage || ''}
                  onChange={(e) => setEditForm({ ...editForm, mileage: Number(e.target.value) })}
                  placeholder="Mileage"
                  className="border p-2 rounded"
                />
                <select
                  value={editForm.drive_type || ''}
                  onChange={(e) => setEditForm({ ...editForm, drive_type: e.target.value })}
                  className="border p-2 rounded"
                >
                  <option value="">Drive Type (optional)</option>
                  <option value="2WD">2WD</option>
                  <option value="FWD">FWD</option>
                  <option value="RWD">RWD</option>
                  <option value="AWD">AWD</option>
                  <option value="4WD">4WD</option>
                </select>
                <input
                  type="text"
                  value={editForm.tire_size || ''}
                  onChange={(e) => setEditForm({ ...editForm, tire_size: e.target.value })}
                  placeholder="Tire Size (e.g., 225/65R17)"
                  className="border p-2 rounded"
                />
              </div>
              <input
                type="text"
                value={editForm.vin || ''}
                onChange={(e) => setEditForm({ ...editForm, vin: e.target.value })}
                placeholder="VIN"
                className="w-full border p-2 rounded"
              />
              <textarea
                value={editForm.notes || ''}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="Notes"
                className="w-full border p-2 rounded"
                rows={2}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Photos
                </label>
                <ImageUpload
                  currentImages={editForm.images || []}
                  onImagesChange={(urls) => setEditForm({ ...editForm, images: urls })}
                  maxImages={10}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdate(vehicle.id)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // View Mode
            <div>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="font-bold text-lg">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                    {vehicle.trim && <span className="text-gray-600 font-normal ml-2">({vehicle.trim})</span>}
                  </h2>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm">
                    {vehicle.license_plate && <p className="text-gray-600">License: {vehicle.license_plate}</p>}
                    {vehicle.body_type && <p className="text-gray-600">{vehicle.body_type}</p>}
                    {vehicle.drive_type && <p className="text-gray-600">{vehicle.drive_type}</p>}
                    {vehicle.tire_size && <p className="text-gray-600">Tires: {vehicle.tire_size}</p>}
                  </div>
                  {vehicle.vin && <p className="text-sm text-gray-500 mt-1">VIN: {vehicle.vin}</p>}
                  {vehicle.color && <p className="text-sm">Color: {vehicle.color}</p>}
                  {vehicle.mileage && <p className="text-sm">Mileage: {vehicle.mileage.toLocaleString()} miles</p>}
                  {vehicle.notes && <p className="mt-2 text-gray-700 text-sm">Notes: {vehicle.notes}</p>}
                </div>
                <div className="flex gap-2 ml-4">
                  <Link
                    to={`/vehicle/${vehicle.id}`}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 inline-block"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => startEdit(vehicle)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(vehicle.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {vehicle.images && vehicle.images.length > 0 && (
                <div className="mt-3">
                  {vehicle.images.length === 1 ? (
                    <img
                      src={vehicle.images[0]}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="max-w-xs rounded-lg"
                    />
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-w-md">
                      {vehicle.images.map((imageUrl, index) => (
                        <img
                          key={index}
                          src={imageUrl}
                          alt={`${vehicle.make} ${vehicle.model} - ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
    </>
  );
};
