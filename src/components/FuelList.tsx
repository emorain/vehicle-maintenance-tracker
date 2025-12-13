// src/components/FuelList.tsx
import { useState } from 'react';
import { FuelService } from '../services/FuelService';
import { FuelRecordWithMPG } from '../types/Fuel';
import { ConfirmModal } from './ConfirmModal';
import { Toast } from './Toast';
import { useSettings } from '../contexts/SettingsContext';
import { formatDistance, formatFuelVolume, formatFuelEconomy } from '../utils/unitConversions';

interface FuelListProps {
  records: FuelRecordWithMPG[];
  onEdit: (record: FuelRecordWithMPG) => void;
  onRefresh: () => void;
}

export const FuelList = ({ records, onEdit, onRefresh }: FuelListProps) => {
  const { settings } = useSettings();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await FuelService.deleteFuelRecord(deleteId);
      setToast({ message: 'Fuel record deleted', type: 'success' });
      setDeleteId(null);
      onRefresh();
    } catch (error: any) {
      setToast({ message: error.message || 'Failed to delete fuel record', type: 'error' });
    }
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No fuel records yet. Add your first fill-up to start tracking!</p>
      </div>
    );
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {deleteId && (
        <ConfirmModal
          title="Delete Fuel Record"
          message="Are you sure you want to delete this fuel record? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}

      <div className="space-y-3">
        {records.map((record) => (
          <div
            key={record.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              {/* Left side: Date and main info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg font-semibold text-gray-800">
                    {new Date(record.fill_date).toLocaleDateString()}
                  </span>
                  {record.partial_fill && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Partial Fill
                    </span>
                  )}
                  {record.trip_type === 'Business' && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Business
                    </span>
                  )}
                </div>

                {/* Odometer & Fuel */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-2">
                  <div>
                    <span className="text-gray-500">Odometer:</span>
                    <span className="ml-1 font-medium">{formatDistance(record.odometer, settings)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Fuel:</span>
                    <span className="ml-1 font-medium">{formatFuelVolume(record.gallons, settings)}</span>
                  </div>
                  {record.mpg && record.miles_driven && (
                    <div>
                      <span className="text-gray-500">Economy:</span>
                      <span className="ml-1 font-medium text-green-600">
                        {formatFuelEconomy(record.miles_driven, record.gallons, settings)}
                      </span>
                    </div>
                  )}
                  {record.miles_driven && (
                    <div>
                      <span className="text-gray-500">Distance:</span>
                      <span className="ml-1 font-medium">{formatDistance(record.miles_driven, settings)}</span>
                    </div>
                  )}
                </div>

                {/* Cost info */}
                {(record.price_per_gallon || record.total_cost) && (
                  <div className="flex gap-4 text-sm mb-2">
                    {record.price_per_gallon && (
                      <div>
                        <span className="text-gray-500">Price/gal:</span>
                        <span className="ml-1 font-medium">
                          ${record.price_per_gallon.toFixed(3)}
                        </span>
                      </div>
                    )}
                    {record.total_cost && (
                      <div>
                        <span className="text-gray-500">Total:</span>
                        <span className="ml-1 font-medium text-blue-600">
                          ${record.total_cost.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Station & Location */}
                {(record.station_name || record.location) && (
                  <div className="text-sm text-gray-600 mb-2">
                    {record.station_name && (
                      <span className="font-medium">{record.station_name}</span>
                    )}
                    {record.station_name && record.location && <span> • </span>}
                    {record.location && <span>{record.location}</span>}
                  </div>
                )}

                {/* Fuel Grade */}
                {record.fuel_grade && (
                  <div className="text-sm text-gray-600">
                    <span className="text-gray-500">Grade:</span>
                    <span className="ml-1">{record.fuel_grade}</span>
                  </div>
                )}

                {/* Notes */}
                {record.notes && (
                  <div className="mt-2 text-sm text-gray-600 italic border-l-2 border-gray-300 pl-3">
                    {record.notes}
                  </div>
                )}
              </div>

              {/* Right side: Action buttons */}
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => onEdit(record)}
                  className="text-blue-600 hover:text-blue-800 p-2"
                  title="Edit"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setDeleteId(record.id)}
                  className="text-red-600 hover:text-red-800 p-2"
                  title="Delete"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
