import { useEffect, useState } from 'react';
import { MaintenanceService } from '../services/MaintenanceService';
import { MaintenanceRecord, SERVICE_TYPES } from '../types/Maintenance';
import { Toast } from './Toast';
import { ConfirmModal } from './ConfirmModal';
import { MaintenanceForm } from './MaintenanceForm';

interface MaintenanceListProps {
  vehicleId: string;
  refreshKey?: number;
}

export const MaintenanceList = ({ vehicleId, refreshKey }: MaintenanceListProps) => {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<MaintenanceRecord | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [totalCost, setTotalCost] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('All');

  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await MaintenanceService.getMaintenanceByVehicle(vehicleId);
      setRecords(data);

      // Calculate total cost
      const total = data.reduce((sum, record) => sum + (record.cost || 0), 0);
      setTotalCost(total);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load maintenance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [vehicleId, refreshKey]);

  const handleDelete = async (id: string) => {
    try {
      await MaintenanceService.deleteMaintenance(id);
      setRecords(records.filter((r) => r.id !== id));
      setToast({ message: 'Maintenance record deleted', type: 'success' });
      setDeleteConfirm(null);
      fetchRecords(); // Refresh to update total cost
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to delete record', type: 'error' });
      setDeleteConfirm(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Filter maintenance records
  const filteredRecords = records.filter(record => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' ||
      record.service_type.toLowerCase().includes(searchLower) ||
      record.description?.toLowerCase().includes(searchLower) ||
      record.notes?.toLowerCase().includes(searchLower);

    // Service type filter
    const matchesServiceType = serviceTypeFilter === 'All' || record.service_type === serviceTypeFilter;

    return matchesSearch && matchesServiceType;
  });

  // Calculate filtered total cost
  const filteredTotalCost = filteredRecords.reduce((sum, record) => sum + (record.cost || 0), 0);

  if (loading) return <p className="text-gray-600">Loading maintenance records...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {deleteConfirm && (
        <ConfirmModal
          title="Delete Maintenance Record"
          message="Are you sure you want to delete this maintenance record? This action cannot be undone."
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <MaintenanceForm
              vehicleId={vehicleId}
              existingRecord={editingRecord}
              onSuccess={() => {
                setEditingRecord(null);
                fetchRecords();
              }}
              onCancel={() => setEditingRecord(null)}
            />
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Search and Filter */}
        {records.length > 0 && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Input */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search maintenance records (service type, description, notes)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Service Type Filter */}
              <div className="sm:w-56">
                <select
                  value={serviceTypeFilter}
                  onChange={(e) => setServiceTypeFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="All">All Service Types</option>
                  {SERVICE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results count */}
            <p className="text-sm text-gray-600">
              Showing {filteredRecords.length} of {records.length} record{records.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Summary Stats */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">
                {searchQuery || serviceTypeFilter !== 'All' ? 'Filtered' : 'Total'} Records
              </p>
              <p className="text-2xl font-bold text-blue-600">{filteredRecords.length}</p>
              {(searchQuery || serviceTypeFilter !== 'All') && filteredRecords.length !== records.length && (
                <p className="text-xs text-gray-500">of {records.length} total</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">
                {searchQuery || serviceTypeFilter !== 'All' ? 'Filtered' : 'Total'} Cost
              </p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(filteredTotalCost)}</p>
              {(searchQuery || serviceTypeFilter !== 'All') && filteredTotalCost !== totalCost && (
                <p className="text-xs text-gray-500">of {formatCurrency(totalCost)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Records List */}
        {records.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No maintenance records yet. Add your first service record above!
          </p>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No maintenance records match your search criteria.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setServiceTypeFilter('All');
              }}
              className="mt-2 text-blue-600 hover:text-blue-800 underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-block bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded">
                        {record.service_type}
                      </span>
                      <span className="text-sm text-gray-500">{formatDate(record.service_date)}</span>
                    </div>

                    {record.description && (
                      <p className="text-gray-800 font-medium mb-1">{record.description}</p>
                    )}

                    <div className="flex gap-4 text-sm text-gray-600">
                      {record.mileage && (
                        <span>📊 {record.mileage.toLocaleString()} mi</span>
                      )}
                      {record.cost && (
                        <span className="font-semibold text-green-600">
                          💰 {formatCurrency(record.cost)}
                        </span>
                      )}
                    </div>

                    {record.notes && (
                      <p className="mt-2 text-sm text-gray-600 italic">
                        Note: {record.notes}
                      </p>
                    )}

                    {/* Receipts/Documents */}
                    {record.receipts && record.receipts.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-2">📎 Attached Documents ({record.receipts.length})</p>
                        <div className="flex flex-wrap gap-2">
                          {record.receipts.map((url, index) => (
                            <a
                              key={index}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded border border-gray-300"
                            >
                              📄 Document {index + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => {
                        // Create a template from this record with today's date
                        const template: MaintenanceRecord = {
                          ...record,
                          id: '', // Will be generated on save
                          service_date: new Date().toISOString().split('T')[0],
                          mileage: undefined, // User should enter current mileage
                          cost: record.cost, // Keep same cost as reference
                          created_at: '', // Will be generated
                        };
                        setEditingRecord(template);
                      }}
                      className="text-green-600 hover:text-green-800 p-2"
                      title="Repeat this service"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setEditingRecord(record)}
                      className="text-blue-600 hover:text-blue-800 p-2"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(record.id)}
                      className="text-red-600 hover:text-red-800 p-2"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
