import { useEffect, useState } from 'react';
import { VehicleService } from '../services/VehicleService';
import { ProtocolService } from '../services/ProtocolService';
import { Vehicle } from '../types/Vehicle';
import { MaintenanceDue } from '../types/Protocol';
import { Link } from 'react-router-dom';
import { Analytics } from '../components/Analytics';
import { useSettings } from '../contexts/SettingsContext';
import { formatDistance } from '../utils/unitConversions';

export const Dashboard = () => {
  const { settings } = useSettings();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [maintenanceDue, setMaintenanceDue] = useState<MaintenanceDue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesData, maintenanceData] = await Promise.all([
          VehicleService.getVehicles(),
          ProtocolService.getAllUpcomingMaintenance(),
        ]);
        setVehicles(vehiclesData);
        setMaintenanceDue(maintenanceData);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-3 sm:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard Overview</h2>
        <Link
          to="/inventory"
          className="w-full sm:w-auto text-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Manage Inventory
        </Link>
      </div>

      {loading && <p>Loading vehicles...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Warranty Expiration Alerts */}
      {!loading && !error && vehicles.length > 0 && (() => {
        const today = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(today.getDate() + 30);

        const expiredWarranties = vehicles.filter(v =>
          v.warranty_expiration && new Date(v.warranty_expiration) < today
        );

        const expiringWarranties = vehicles.filter(v =>
          v.warranty_expiration &&
          new Date(v.warranty_expiration) >= today &&
          new Date(v.warranty_expiration) <= thirtyDaysFromNow
        );

        if (expiredWarranties.length === 0 && expiringWarranties.length === 0) return null;

        return (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Warranty Alerts</h2>

            {/* Expired Warranties */}
            {expiredWarranties.length > 0 && (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-bold text-red-800 mb-3 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Expired Warranties ({expiredWarranties.length})
                </h3>
                <div className="space-y-2">
                  {expiredWarranties.map(vehicle => {
                    const daysExpired = Math.floor((today.getTime() - new Date(vehicle.warranty_expiration!).getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={vehicle.id} className="bg-white rounded p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </p>
                          <p className="text-sm text-gray-600">
                            Warranty expired on {new Date(vehicle.warranty_expiration!).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-red-600">
                            {daysExpired} day{daysExpired !== 1 ? 's' : ''} ago
                          </p>
                        </div>
                        <Link
                          to={`/vehicle/${vehicle.id}`}
                          className="w-full sm:w-auto text-center bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
                        >
                          View Vehicle
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Expiring Soon Warranties */}
            {expiringWarranties.length > 0 && (
              <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                <h3 className="text-lg font-bold text-orange-800 mb-3 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Warranties Expiring Soon ({expiringWarranties.length})
                </h3>
                <div className="space-y-2">
                  {expiringWarranties.map(vehicle => {
                    const daysUntilExpiration = Math.floor((new Date(vehicle.warranty_expiration!).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={vehicle.id} className="bg-white rounded p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </p>
                          <p className="text-sm text-gray-600">
                            Warranty expires on {new Date(vehicle.warranty_expiration!).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-orange-700">
                            {daysUntilExpiration} day{daysUntilExpiration !== 1 ? 's' : ''} remaining
                          </p>
                        </div>
                        <Link
                          to={`/vehicle/${vehicle.id}`}
                          className="w-full sm:w-auto text-center bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 text-sm"
                        >
                          View Vehicle
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Upcoming/Overdue Maintenance */}
      {!loading && !error && maintenanceDue.length > 0 && (
        <div className="mb-6" data-reminders>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Maintenance Reminders</h2>

          {/* Overdue Maintenance */}
          {maintenanceDue.filter(m => m.is_overdue).length > 0 && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-bold text-red-800 mb-3 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Overdue Maintenance ({maintenanceDue.filter(m => m.is_overdue).length})
              </h3>
              <div className="space-y-2">
                {maintenanceDue
                  .filter(m => m.is_overdue)
                  .map((maintenance, index) => {
                    const vehicle = vehicles.find(v => v.id === maintenance.vehicle_id);
                    return (
                      <div key={index} className="bg-white rounded p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <p className="font-semibold text-gray-800">{maintenance.protocol_name}</p>
                          <p className="text-sm text-gray-600">
                            {vehicle && `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                          </p>
                          {maintenance.days_until_due !== null && maintenance.days_until_due < 0 && (
                            <p className="text-xs text-red-600">
                              {Math.abs(maintenance.days_until_due)} days overdue
                            </p>
                          )}
                          {maintenance.miles_until_due !== null && maintenance.miles_until_due < 0 && (
                            <p className="text-xs text-red-600">
                              {Math.abs(maintenance.miles_until_due).toLocaleString()} miles overdue
                            </p>
                          )}
                        </div>
                        <Link
                          to={`/vehicle/${maintenance.vehicle_id}`}
                          className="w-full sm:w-auto text-center bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
                        >
                          View Vehicle
                        </Link>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Upcoming Maintenance (next 30 days or 3000 miles) */}
          {maintenanceDue.filter(m =>
            !m.is_overdue &&
            ((m.days_until_due !== null && m.days_until_due <= 30) ||
             (m.miles_until_due !== null && m.miles_until_due <= 3000))
          ).length > 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <h3 className="text-lg font-bold text-yellow-800 mb-3 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Upcoming Maintenance
              </h3>
              <div className="space-y-2">
                {maintenanceDue
                  .filter(m =>
                    !m.is_overdue &&
                    ((m.days_until_due !== null && m.days_until_due <= 30) ||
                     (m.miles_until_due !== null && m.miles_until_due <= 3000))
                  )
                  .slice(0, 5)
                  .map((maintenance, index) => {
                    const vehicle = vehicles.find(v => v.id === maintenance.vehicle_id);
                    return (
                      <div key={index} className="bg-white rounded p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <p className="font-semibold text-gray-800">{maintenance.protocol_name}</p>
                          <p className="text-sm text-gray-600">
                            {vehicle && `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                          </p>
                          {maintenance.days_until_due !== null && maintenance.days_until_due > 0 && (
                            <p className="text-xs text-yellow-700">
                              Due in {maintenance.days_until_due} days
                            </p>
                          )}
                          {maintenance.miles_until_due !== null && maintenance.miles_until_due > 0 && (
                            <p className="text-xs text-yellow-700">
                              Due in {maintenance.miles_until_due.toLocaleString()} miles
                            </p>
                          )}
                        </div>
                        <Link
                          to={`/vehicle/${maintenance.vehicle_id}`}
                          className="w-full sm:w-auto text-center bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 text-sm"
                        >
                          View Vehicle
                        </Link>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && !error && vehicles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-4">No vehicles in your fleet yet.</p>
          <Link
            to="/inventory"
            className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
          >
            Add Your First Vehicle
          </Link>
        </div>
      )}

      {/* Analytics Section */}
      {!loading && !error && vehicles.length > 0 && (
        <div className="mb-8">
          <Analytics />
        </div>
      )}

      {!loading && !error && vehicles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-xl text-gray-800">
                    {vehicle.year} {vehicle.make}
                  </h3>
                  <p className="text-gray-600">{vehicle.model}</p>
                </div>
              </div>

              {vehicle.license_plate && (
                <p className="text-sm text-gray-500 mb-2">
                  License: {vehicle.license_plate}
                </p>
              )}

              {vehicle.mileage && (
                <p className="text-sm text-gray-600">
                  Odometer: {formatDistance(vehicle.mileage, settings)}
                </p>
              )}

              {vehicle.image_url && (
                <img
                  src={vehicle.image_url}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="mt-4 w-full h-40 object-cover rounded"
                />
              )}

              <Link
                to={`/vehicle/${vehicle.id}`}
                className="mt-4 block text-center bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                View Details & Maintenance
              </Link>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold mb-4">Quick Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded">
            <p className="text-sm text-gray-600">Total Vehicles</p>
            <p className="text-2xl font-bold text-blue-600">{vehicles.length}</p>
          </div>
          <div className={`p-4 rounded ${maintenanceDue.filter(m => m.is_overdue).length > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
            <p className="text-sm text-gray-600">
              {maintenanceDue.filter(m => m.is_overdue).length > 0 ? 'Overdue Maintenance' : 'Upcoming Maintenance'}
            </p>
            <p className={`text-2xl font-bold ${maintenanceDue.filter(m => m.is_overdue).length > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {maintenanceDue.filter(m => m.is_overdue).length > 0
                ? maintenanceDue.filter(m => m.is_overdue).length
                : maintenanceDue.filter(m =>
                    !m.is_overdue &&
                    ((m.days_until_due !== null && m.days_until_due <= 30) ||
                     (m.miles_until_due !== null && m.miles_until_due <= 3000))
                  ).length
              }
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded">
            <p className="text-sm text-gray-600">Active Protocols</p>
            <p className="text-2xl font-bold text-purple-600">{maintenanceDue.length}</p>
          </div>
          <div className={`p-4 rounded ${(() => {
            const today = new Date();
            const expiredCount = vehicles.filter(v => v.warranty_expiration && new Date(v.warranty_expiration) < today).length;
            const activeCount = vehicles.filter(v => v.warranty_expiration && new Date(v.warranty_expiration) >= today).length;
            return expiredCount > 0 ? 'bg-red-50' : activeCount > 0 ? 'bg-green-50' : 'bg-gray-50';
          })()}`}>
            <p className="text-sm text-gray-600">Warranty Status</p>
            <p className={`text-2xl font-bold ${(() => {
              const today = new Date();
              const expiredCount = vehicles.filter(v => v.warranty_expiration && new Date(v.warranty_expiration) < today).length;
              const activeCount = vehicles.filter(v => v.warranty_expiration && new Date(v.warranty_expiration) >= today).length;
              return expiredCount > 0 ? 'text-red-600' : activeCount > 0 ? 'text-green-600' : 'text-gray-600';
            })()}`}>
              {(() => {
                const today = new Date();
                const expiredCount = vehicles.filter(v => v.warranty_expiration && new Date(v.warranty_expiration) < today).length;
                const activeCount = vehicles.filter(v => v.warranty_expiration && new Date(v.warranty_expiration) >= today).length;
                if (expiredCount > 0) return `${expiredCount} Expired`;
                if (activeCount > 0) return `${activeCount} Active`;
                return 'None Set';
              })()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
