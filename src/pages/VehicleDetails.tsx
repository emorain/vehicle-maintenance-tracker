import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { VehicleService } from '../services/VehicleService';
import { Vehicle } from '../types/Vehicle';
import { MaintenanceForm } from '../components/MaintenanceForm';
import { MaintenanceList } from '../components/MaintenanceList';
import { ProtocolAssignment } from '../components/ProtocolAssignment';
import { FuelService } from '../services/FuelService';
import { FuelRecordWithMPG, FuelStats as FuelStatsType } from '../types/Fuel';
import { FuelForm } from '../components/FuelForm';
import { FuelList } from '../components/FuelList';
import { FuelStats } from '../components/FuelStats';

export const VehicleDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'maintenance' | 'protocols' | 'fuel'>('maintenance');
  const [fuelRecords, setFuelRecords] = useState<FuelRecordWithMPG[]>([]);
  const [fuelStats, setFuelStats] = useState<FuelStatsType | null>(null);
  const [showFuelForm, setShowFuelForm] = useState(false);
  const [editingFuel, setEditingFuel] = useState<FuelRecordWithMPG | null>(null);

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

  const fetchFuelRecords = async () => {
    if (!vehicle) return;
    try {
      const [records, stats] = await Promise.all([
        FuelService.getFuelRecords(vehicle.id),
        FuelService.getFuelStats(vehicle.id),
      ]);
      setFuelRecords(records);
      setFuelStats(stats);
    } catch (error) {
      console.error('Failed to fetch fuel records:', error);
    }
  };

  const handleFuelFormSuccess = () => {
    setShowFuelForm(false);
    setEditingFuel(null);
    fetchFuelRecords();
    fetchVehicle(); // Refresh vehicle to update mileage
  };

  const handleEditFuel = (record: FuelRecordWithMPG) => {
    setEditingFuel(record);
    setShowFuelForm(true);
    setActiveTab('fuel');
  };

  useEffect(() => {
    fetchVehicle();
  }, [id, navigate]);

  useEffect(() => {
    if (vehicle) {
      fetchFuelRecords();
    }
  }, [vehicle]);

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

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('maintenance')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'maintenance'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🔧 Maintenance
            </button>
            <button
              onClick={() => setActiveTab('protocols')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'protocols'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📋 Protocols
            </button>
            <button
              onClick={() => setActiveTab('fuel')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'fuel'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              ⛽ Fuel Tracking
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Maintenance Tab */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
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
                <div>
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
          )}

          {/* Protocols Tab */}
          {activeTab === 'protocols' && (
            <div>
              <ProtocolAssignment
                vehicleId={vehicle.id}
                currentMileage={vehicle.mileage || undefined}
                refreshKey={refreshKey}
              />
            </div>
          )}

          {/* Fuel Tab */}
          {activeTab === 'fuel' && (
            <div className="space-y-6">
              {/* Fuel Statistics */}
              {fuelStats && fuelRecords.length > 0 && (
                <FuelStats stats={fuelStats} />
              )}

              {/* Add Fuel Record Button */}
              {!showFuelForm && (
                <button
                  onClick={() => {
                    setShowFuelForm(true);
                    setEditingFuel(null);
                  }}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Fuel Record
                </button>
              )}

              {/* Fuel Form */}
              {showFuelForm && (
                <FuelForm
                  vehicleId={vehicle.id}
                  onSuccess={handleFuelFormSuccess}
                  existingRecord={editingFuel || undefined}
                  onCancel={() => {
                    setShowFuelForm(false);
                    setEditingFuel(null);
                  }}
                  currentMileage={vehicle.mileage}
                />
              )}

              {/* Fuel Records List */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Fuel History</h3>
                <FuelList
                  records={fuelRecords}
                  onEdit={handleEditFuel}
                  onRefresh={fetchFuelRecords}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
