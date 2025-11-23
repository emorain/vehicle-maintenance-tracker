// src/pages/Protocols.tsx
import { useEffect, useState } from 'react';
import { ProtocolService } from '../services/ProtocolService';
import { MaintenanceProtocol } from '../types/Protocol';
import { Toast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';

export const Protocols = () => {
  const [protocols, setProtocols] = useState<MaintenanceProtocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProtocol, setEditingProtocol] = useState<MaintenanceProtocol | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    service_type: '',
    interval_months: '',
    interval_miles: '',
    description: '',
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchProtocols = async () => {
    setLoading(true);
    try {
      const data = await ProtocolService.getAllProtocols();
      setProtocols(data);
    } catch (err: any) {
      console.error(err);
      setToast({ message: 'Failed to load protocols', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProtocols();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.service_type) {
      setToast({ message: 'Name and service type are required', type: 'error' });
      return;
    }

    if (!formData.interval_months && !formData.interval_miles) {
      setToast({ message: 'At least one interval (months or miles) is required', type: 'error' });
      return;
    }

    try {
      const protocolData = {
        name: formData.name,
        service_type: formData.service_type,
        interval_months: formData.interval_months ? Number(formData.interval_months) : null,
        interval_miles: formData.interval_miles ? Number(formData.interval_miles) : null,
        description: formData.description || null,
      };

      if (editingProtocol) {
        await ProtocolService.updateProtocol(editingProtocol.id, protocolData);
        setToast({ message: 'Protocol updated successfully', type: 'success' });
      } else {
        await ProtocolService.createProtocol(protocolData);
        setToast({ message: 'Protocol created successfully', type: 'success' });
      }

      setFormData({ name: '', service_type: '', interval_months: '', interval_miles: '', description: '' });
      setShowForm(false);
      setEditingProtocol(null);
      fetchProtocols();
    } catch (err: any) {
      console.error(err);
      setToast({ message: 'Failed to save protocol', type: 'error' });
    }
  };

  const handleEdit = (protocol: MaintenanceProtocol) => {
    setEditingProtocol(protocol);
    setFormData({
      name: protocol.name,
      service_type: protocol.service_type,
      interval_months: protocol.interval_months?.toString() || '',
      interval_miles: protocol.interval_miles?.toString() || '',
      description: protocol.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await ProtocolService.deleteProtocol(id);
      setProtocols(protocols.filter(p => p.id !== id));
      setToast({ message: 'Protocol deleted successfully', type: 'success' });
      setDeleteConfirm(null);
    } catch (err: any) {
      console.error(err);
      setToast({ message: 'Failed to delete protocol', type: 'error' });
      setDeleteConfirm(null);
    }
  };

  const handleCancelForm = () => {
    setFormData({ name: '', service_type: '', interval_months: '', interval_miles: '', description: '' });
    setShowForm(false);
    setEditingProtocol(null);
  };

  const defaultProtocols = protocols.filter(p => p.is_default);
  const customProtocols = protocols.filter(p => !p.is_default);

  if (loading) return <div className="p-6 text-center">Loading protocols...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {deleteConfirm && (
        <ConfirmModal
          title="Delete Protocol"
          message="Are you sure you want to delete this protocol? This will also remove it from any vehicles it's assigned to."
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Maintenance Protocols</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {showForm ? 'Cancel' : 'Create Custom Protocol'}
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingProtocol ? 'Edit Protocol' : 'Create New Protocol'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Protocol Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Oil Change - 7.5k miles"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Type *
                </label>
                <input
                  type="text"
                  value={formData.service_type}
                  onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                  placeholder="e.g., Oil Change"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interval (Months)
                </label>
                <input
                  type="number"
                  value={formData.interval_months}
                  onChange={(e) => setFormData({ ...formData, interval_months: e.target.value })}
                  placeholder="e.g., 3"
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interval (Miles)
                </label>
                <input
                  type="number"
                  value={formData.interval_miles}
                  onChange={(e) => setFormData({ ...formData, interval_miles: e.target.value })}
                  placeholder="e.g., 3000"
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description or notes about this protocol"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold"
              >
                {editingProtocol ? 'Update Protocol' : 'Create Protocol'}
              </button>
              <button
                type="button"
                onClick={handleCancelForm}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Default Protocols */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Default Protocols</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {defaultProtocols.map((protocol) => (
            <div key={protocol.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-4 border-2 border-blue-200">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-lg text-gray-800">{protocol.name}</h3>
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">Default</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{protocol.service_type}</p>
              <div className="flex gap-3 text-sm text-gray-700 mb-2">
                {protocol.interval_months && (
                  <span className="bg-white px-2 py-1 rounded">📅 {protocol.interval_months} months</span>
                )}
                {protocol.interval_miles && (
                  <span className="bg-white px-2 py-1 rounded">📊 {protocol.interval_miles.toLocaleString()} mi</span>
                )}
              </div>
              {protocol.description && (
                <p className="text-xs text-gray-600 italic">{protocol.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Custom Protocols */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Custom Protocols</h2>
        {customProtocols.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No custom protocols yet. Create one to get started!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customProtocols.map((protocol) => (
              <div key={protocol.id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-gray-800">{protocol.name}</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(protocol)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(protocol.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{protocol.service_type}</p>
                <div className="flex gap-3 text-sm text-gray-700 mb-2">
                  {protocol.interval_months && (
                    <span className="bg-gray-100 px-2 py-1 rounded">📅 {protocol.interval_months} months</span>
                  )}
                  {protocol.interval_miles && (
                    <span className="bg-gray-100 px-2 py-1 rounded">📊 {protocol.interval_miles.toLocaleString()} mi</span>
                  )}
                </div>
                {protocol.description && (
                  <p className="text-xs text-gray-600 italic">{protocol.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
