import { useEffect, useState } from 'react';
import { MaintenanceService } from '../services/MaintenanceService';
import { VehicleService } from '../services/VehicleService';
import { MaintenanceRecord } from '../types/Maintenance';
import { Vehicle } from '../types/Vehicle';

interface SpendingByMonth {
  month: string;
  amount: number;
}

interface SpendingByServiceType {
  serviceType: string;
  amount: number;
  count: number;
}

interface SpendingByVehicle {
  vehicleId: string;
  vehicleName: string;
  amount: number;
  count: number;
}

export const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [timeRange, setTimeRange] = useState<'3months' | '6months' | '1year' | 'all'>('6months');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [maintenanceData, vehicleData] = await Promise.all([
          MaintenanceService.getAllMaintenance(),
          VehicleService.getVehicles(),
        ]);
        setRecords(maintenanceData);
        setVehicles(vehicleData);
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter records by time range
  const getFilteredRecords = () => {
    if (timeRange === 'all') return records;

    const now = new Date();
    const monthsBack = timeRange === '3months' ? 3 : timeRange === '6months' ? 6 : 12;
    const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);

    return records.filter(record => new Date(record.service_date) >= cutoffDate);
  };

  const filteredRecords = getFilteredRecords();

  // Calculate total spending
  const totalSpending = filteredRecords.reduce((sum, record) => sum + (record.cost || 0), 0);
  const averageServiceCost = filteredRecords.length > 0 ? totalSpending / filteredRecords.length : 0;

  // Calculate spending by month
  const spendingByMonth: SpendingByMonth[] = [];
  const monthMap = new Map<string, number>();

  filteredRecords.forEach(record => {
    if (record.cost) {
      const date = new Date(record.service_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + record.cost);
    }
  });

  // Convert to array and sort
  Array.from(monthMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([month, amount]) => {
      const [year, monthNum] = month.split('-');
      const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      spendingByMonth.push({ month: monthName, amount });
    });

  // Calculate spending by service type
  const serviceTypeMap = new Map<string, { amount: number; count: number }>();
  filteredRecords.forEach(record => {
    const existing = serviceTypeMap.get(record.service_type) || { amount: 0, count: 0 };
    serviceTypeMap.set(record.service_type, {
      amount: existing.amount + (record.cost || 0),
      count: existing.count + 1,
    });
  });

  const spendingByServiceType: SpendingByServiceType[] = Array.from(serviceTypeMap.entries())
    .map(([serviceType, data]) => ({ serviceType, amount: data.amount, count: data.count }))
    .sort((a, b) => b.amount - a.amount);

  // Calculate spending by vehicle
  const vehicleMap = new Map<string, { amount: number; count: number }>();
  filteredRecords.forEach(record => {
    const existing = vehicleMap.get(record.vehicle_id) || { amount: 0, count: 0 };
    vehicleMap.set(record.vehicle_id, {
      amount: existing.amount + (record.cost || 0),
      count: existing.count + 1,
    });
  });

  const spendingByVehicle: SpendingByVehicle[] = Array.from(vehicleMap.entries())
    .map(([vehicleId, data]) => {
      const vehicle = vehicles.find(v => v.id === vehicleId);
      const vehicleName = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle';
      return { vehicleId, vehicleName, amount: data.amount, count: data.count };
    })
    .sort((a, b) => b.amount - a.amount);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const maxMonthlySpending = Math.max(...spendingByMonth.map(m => m.amount), 1);
  const maxServiceTypeSpending = Math.max(...spendingByServiceType.map(s => s.amount), 1);
  const maxVehicleSpending = Math.max(...spendingByVehicle.map(v => v.amount), 1);

  if (loading) {
    return <div className="text-gray-600">Loading analytics...</div>;
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No maintenance records yet.</p>
        <p className="text-sm mt-2">Add maintenance records to see analytics and insights.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Analytics & Insights</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('3months')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              timeRange === '3months'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            3 Months
          </button>
          <button
            onClick={() => setTimeRange('6months')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              timeRange === '6months'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            6 Months
          </button>
          <button
            onClick={() => setTimeRange('1year')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              timeRange === '1year'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            1 Year
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              timeRange === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600 font-medium mb-1">Total Spending</p>
          <p className="text-3xl font-bold text-blue-900">{formatCurrency(totalSpending)}</p>
          <p className="text-xs text-blue-600 mt-1">{filteredRecords.length} services</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <p className="text-sm text-green-600 font-medium mb-1">Avg Service Cost</p>
          <p className="text-3xl font-bold text-green-900">{formatCurrency(averageServiceCost)}</p>
          <p className="text-xs text-green-600 mt-1">per service</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-600 font-medium mb-1">Total Vehicles</p>
          <p className="text-3xl font-bold text-purple-900">{spendingByVehicle.length}</p>
          <p className="text-xs text-purple-600 mt-1">with maintenance</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
          <p className="text-sm text-orange-600 font-medium mb-1">Service Types</p>
          <p className="text-3xl font-bold text-orange-900">{spendingByServiceType.length}</p>
          <p className="text-xs text-orange-600 mt-1">categories</p>
        </div>
      </div>

      {/* Monthly Spending Trend */}
      {spendingByMonth.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Monthly Spending Trend</h3>
          <div className="space-y-3">
            {spendingByMonth.map((data, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 font-medium">{data.month}</span>
                  <span className="text-gray-900 font-semibold">{formatCurrency(data.amount)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(data.amount / maxMonthlySpending) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spending by Service Type */}
      {spendingByServiceType.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Spending by Service Type</h3>
          <div className="space-y-3">
            {spendingByServiceType.map((data, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 font-medium">
                    {data.serviceType} <span className="text-gray-500">({data.count} services)</span>
                  </span>
                  <span className="text-gray-900 font-semibold">{formatCurrency(data.amount)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(data.amount / maxServiceTypeSpending) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Spending by Vehicle */}
      {spendingByVehicle.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Spending by Vehicle</h3>
          <div className="space-y-3">
            {spendingByVehicle.map((data, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 font-medium">
                    {data.vehicleName} <span className="text-gray-500">({data.count} services)</span>
                  </span>
                  <span className="text-gray-900 font-semibold">{formatCurrency(data.amount)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(data.amount / maxVehicleSpending) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
