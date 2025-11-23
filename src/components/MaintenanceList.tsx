import { useEffect, useState } from 'react';
import { MaintenanceService } from '../services/MaintenanceService';
import { MaintenanceRecord } from '../types/Maintenance';
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
        {/* Summary Stats */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Records</p>
              <p className="text-2xl font-bold text-blue-600">{records.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Cost</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(totalCost)}</p>
            </div>
          </div>
        </div>

        {/* Records List */}
        {records.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No maintenance records yet. Add your first service record above!
          </p>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
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
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 ml-4">
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
