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
      image_url: vehicle.image_url,
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
                  Vehicle Photo
                </label>
                <ImageUpload
                  currentImageUrl={editForm.image_url}
                  onImageUpload={(url) => setEditForm({ ...editForm, image_url: url })}
                  onImageRemove={() => setEditForm({ ...editForm, image_url: '' })}
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
                  <h2 className="font-bold text-lg">{vehicle.year} {vehicle.make} {vehicle.model}</h2>
                  {vehicle.license_plate && <p className="text-gray-600">License: {vehicle.license_plate}</p>}
                  {vehicle.vin && <p className="text-sm text-gray-500">VIN: {vehicle.vin}</p>}
                  {vehicle.color && <p>Color: {vehicle.color}</p>}
                  {vehicle.mileage && <p>Mileage: {vehicle.mileage.toLocaleString()} miles</p>}
                  {vehicle.notes && <p className="mt-2 text-gray-700">Notes: {vehicle.notes}</p>}
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
              {vehicle.image_url && (
                <img src={vehicle.image_url} alt={`${vehicle.make} ${vehicle.model}`} className="mt-2 max-w-xs rounded" />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
    </>
  );
};
