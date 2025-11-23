import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { VehicleService } from '../services/VehicleService';
import { Vehicle } from '../types/Vehicle';
import { MaintenanceForm } from '../components/MaintenanceForm';
import { MaintenanceList } from '../components/MaintenanceList';
import { ProtocolAssignment } from '../components/ProtocolAssignment';

export const VehicleDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchVehicle = async () => {
      if (!id) return;

      try {
        const data = await VehicleService.getVehicleById(id);
        setVehicle(data);
      } catch (error) {
        console.error('Failed to load vehicle:', error);
        navigate('/inventory');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id, navigate]);

  if (loading) {
    return <div className="p-6 text-center">Loading vehicle details...</div>;
  }

  if (!vehicle) {
    return <div className="p-6 text-center text-red-600">Vehicle not found</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link to="/inventory" className="hover:text-blue-600">
          Inventory
        </Link>
        <span>›</span>
        <span className="text-gray-900 font-medium">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </span>
      </div>

      {/* Vehicle Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Vehicle Image */}
          {vehicle.image_url && (
            <div className="md:w-1/3">
              <img
                src={vehicle.image_url}
                alt={`${vehicle.make} ${vehicle.model}`}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Vehicle Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {vehicle.license_plate && (
                <div>
                  <p className="text-gray-600">License Plate</p>
                  <p className="font-semibold">{vehicle.license_plate}</p>
                </div>
              )}
              {vehicle.vin && (
                <div>
                  <p className="text-gray-600">VIN</p>
                  <p className="font-semibold text-xs">{vehicle.vin}</p>
                </div>
              )}
              {vehicle.color && (
                <div>
                  <p className="text-gray-600">Color</p>
                  <p className="font-semibold">{vehicle.color}</p>
                </div>
              )}
              {vehicle.mileage && (
                <div>
                  <p className="text-gray-600">Mileage</p>
                  <p className="font-semibold">{vehicle.mileage.toLocaleString()} mi</p>
                </div>
              )}
            </div>

            {vehicle.notes && (
              <div className="mt-4">
                <p className="text-gray-600 text-sm">Notes</p>
                <p className="text-gray-800">{vehicle.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Protocol Assignment Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <ProtocolAssignment
          vehicleId={vehicle.id}
          currentMileage={vehicle.mileage || undefined}
          refreshKey={refreshKey}
        />
      </div>

      {/* Maintenance Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Maintenance History</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {showAddForm ? 'Cancel' : 'Add Maintenance'}
          </button>
        </div>

        {/* Add Maintenance Form */}
        {showAddForm && (
          <div className="mb-6">
            <MaintenanceForm
              vehicleId={vehicle.id}
              onSuccess={() => {
                setShowAddForm(false);
                setRefreshKey((prev) => prev + 1);
              }}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {/* Maintenance List */}
        <MaintenanceList vehicleId={vehicle.id} refreshKey={refreshKey} />
      </div>
    </div>
  );
};
