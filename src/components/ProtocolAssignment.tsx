// src/components/ProtocolAssignment.tsx
import { useEffect, useState } from 'react';
import { ProtocolService } from '../services/ProtocolService';
import { MaintenanceProtocol, VehicleProtocolWithDetails, MaintenanceDue } from '../types/Protocol';
import { Toast } from './Toast';
import { ConfirmModal } from './ConfirmModal';

interface ProtocolAssignmentProps {
  vehicleId: string;
  currentMileage?: number;
  refreshKey?: number;
}

export const ProtocolAssignment = ({ vehicleId, currentMileage, refreshKey }: ProtocolAssignmentProps) => {
  const [assignedProtocols, setAssignedProtocols] = useState<VehicleProtocolWithDetails[]>([]);
  const [availableProtocols, setAvailableProtocols] = useState<MaintenanceProtocol[]>([]);
  const [maintenanceDue, setMaintenanceDue] = useState<MaintenanceDue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState('');
  const [lastServiceDate, setLastServiceDate] = useState('');
  const [lastServiceMileage, setLastServiceMileage] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [removeConfirm, setRemoveConfirm] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assigned, all, due] = await Promise.all([
        ProtocolService.getVehicleProtocols(vehicleId),
        ProtocolService.getAllProtocols(),
        ProtocolService.calculateMaintenanceDue(vehicleId, currentMileage),
      ]);

      setAssignedProtocols(assigned);
      setMaintenanceDue(due);

      // Filter out already assigned protocols
      const assignedIds = assigned.map(ap => ap.protocol_id);
      const available = all.filter(p => !assignedIds.includes(p.id));
      setAvailableProtocols(available);
    } catch (err: any) {
      console.error(err);
      setToast({ message: 'Failed to load protocols', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [vehicleId, currentMileage, refreshKey]);

  const handleAssignProtocol = async () => {
    if (!selectedProtocol) {
      setToast({ message: 'Please select a protocol', type: 'error' });
      return;
    }

    try {
      await ProtocolService.assignProtocolToVehicle(
        vehicleId,
        selectedProtocol,
        lastServiceDate || undefined,
        lastServiceMileage ? Number(lastServiceMileage) : undefined
      );

      setToast({ message: 'Protocol assigned successfully', type: 'success' });
      setShowAddModal(false);
      setSelectedProtocol('');
      setLastServiceDate('');
      setLastServiceMileage('');
      fetchData();
    } catch (err: any) {
      console.error(err);
      setToast({ message: 'Failed to assign protocol', type: 'error' });
    }
  };

  const handleRemoveProtocol = async (id: string) => {
    try {
      await ProtocolService.removeProtocolFromVehicle(id);
      setToast({ message: 'Protocol removed successfully', type: 'success' });
      setRemoveConfirm(null);
      fetchData();
    } catch (err: any) {
      console.error(err);
      setToast({ message: 'Failed to remove protocol', type: 'error' });
      setRemoveConfirm(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not yet performed';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDueStatus = (protocolId: string) => {
    return maintenanceDue.find(d => d.protocol_id === protocolId);
  };

  if (loading) return <p className="text-gray-600">Loading protocols...</p>;

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {removeConfirm && (
        <ConfirmModal
          title="Remove Protocol"
          message="Are you sure you want to remove this protocol from this vehicle?"
          onConfirm={() => handleRemoveProtocol(removeConfirm)}
          onCancel={() => setRemoveConfirm(null)}
        />
      )}

      {/* Add Protocol Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Assign Protocol to Vehicle</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Protocol *
                </label>
                <select
                  value={selectedProtocol}
                  onChange={(e) => setSelectedProtocol(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Choose a protocol --</option>
                  {availableProtocols.map((protocol) => (
                    <option key={protocol.id} value={protocol.id}>
                      {protocol.name} ({protocol.service_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Service Date (Optional)
                </label>
                <input
                  type="date"
                  value={lastServiceDate}
                  onChange={(e) => setLastServiceDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Service Mileage (Optional)
                </label>
                <input
                  type="number"
                  value={lastServiceMileage}
                  onChange={(e) => setLastServiceMileage(e.target.value)}
                  placeholder="e.g., 15000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={handleAssignProtocol}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
              >
                Assign Protocol
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedProtocol('');
                  setLastServiceDate('');
                  setLastServiceMileage('');
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900">Assigned Maintenance Protocols</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Assign Protocol
        </button>
      </div>

      {/* Assigned Protocols List */}
      {assignedProtocols.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No protocols assigned yet. Assign a protocol to start tracking maintenance!
        </p>
      ) : (
        <div className="space-y-3">
          {assignedProtocols.map((ap) => {
            const dueStatus = getDueStatus(ap.protocol_id);
            const isOverdue = dueStatus?.is_overdue || false;

            return (
              <div
                key={ap.id}
                className={`border rounded-lg p-4 ${
                  isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-lg text-gray-800">{ap.protocol.name}</h4>
                      {isOverdue && (
                        <span className="bg-red-600 text-white text-xs px-2 py-1 rounded font-semibold">
                          OVERDUE
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{ap.protocol.service_type}</p>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-600">Interval</p>
                        <p className="font-semibold">
                          {ap.protocol.interval_months && `${ap.protocol.interval_months} months`}
                          {ap.protocol.interval_months && ap.protocol.interval_miles && ' / '}
                          {ap.protocol.interval_miles && `${ap.protocol.interval_miles.toLocaleString()} mi`}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-600">Last Service</p>
                        <p className="font-semibold">{formatDate(ap.last_service_date)}</p>
                        {ap.last_service_mileage && (
                          <p className="text-xs text-gray-500">at {ap.last_service_mileage.toLocaleString()} mi</p>
                        )}
                      </div>

                      {dueStatus && (
                        <>
                          {dueStatus.due_date && (
                            <div>
                              <p className="text-gray-600">Next Due Date</p>
                              <p className={`font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-800'}`}>
                                {new Date(dueStatus.due_date).toLocaleDateString()}
                              </p>
                              {dueStatus.days_until_due !== null && (
                                <p className="text-xs text-gray-500">
                                  ({dueStatus.days_until_due > 0 ? `in ${dueStatus.days_until_due} days` : `${Math.abs(dueStatus.days_until_due)} days ago`})
                                </p>
                              )}
                            </div>
                          )}

                          {dueStatus.due_mileage && (
                            <div>
                              <p className="text-gray-600">Next Due Mileage</p>
                              <p className={`font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-800'}`}>
                                {dueStatus.due_mileage.toLocaleString()} mi
                              </p>
                              {dueStatus.miles_until_due !== null && (
                                <p className="text-xs text-gray-500">
                                  ({dueStatus.miles_until_due > 0 ? `in ${dueStatus.miles_until_due.toLocaleString()} mi` : `${Math.abs(dueStatus.miles_until_due).toLocaleString()} mi ago`})
                                </p>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setRemoveConfirm(ap.id)}
                    className="text-red-600 hover:text-red-800 p-2 ml-4"
                    title="Remove"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
