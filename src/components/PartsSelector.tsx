// src/components/PartsSelector.tsx
import { useEffect, useState } from 'react';
import { PartsService } from '../services/PartsService';
import { PartSuggestion, PartUsed, COMMON_PART_TYPES } from '../types/Parts';

interface PartsSelectorProps {
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  serviceType: string;
  onPartsChange: (parts: PartUsed[]) => void;
  initialParts?: PartUsed[];
}

export const PartsSelector = ({
  vehicleMake,
  vehicleModel,
  vehicleYear,
  serviceType,
  onPartsChange,
  initialParts = [],
}: PartsSelectorProps) => {
  const [suggestions, setSuggestions] = useState<PartSuggestion[]>([]);
  const [myPartsOnly, setMyPartsOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [customParts, setCustomParts] = useState<PartUsed[]>([]);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newPart, setNewPart] = useState<PartUsed>({ type: '', number: '', brand: '', notes: '' });

  useEffect(() => {
    if (vehicleMake && vehicleModel && vehicleYear && serviceType) {
      fetchSuggestions();
    }
  }, [vehicleMake, vehicleModel, vehicleYear, serviceType, myPartsOnly]);

  useEffect(() => {
    // Initialize with existing parts
    if (initialParts.length > 0) {
      setCustomParts(initialParts);
    }
  }, []);

  useEffect(() => {
    // Notify parent of parts changes
    const selectedParts = Array.from(selectedSuggestions).map(id => {
      const part = suggestions.find(s => s.id === id);
      return {
        type: part!.part_type,
        number: part!.part_number,
        brand: part!.brand || undefined,
      };
    });

    onPartsChange([...selectedParts, ...customParts]);
  }, [selectedSuggestions, customParts]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const parts = await PartsService.getSuggestedParts(
        vehicleMake,
        vehicleModel,
        vehicleYear,
        serviceType,
        myPartsOnly
      );
      setSuggestions(parts);
    } catch (err) {
      console.error('Failed to load part suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSuggestion = (partId: string) => {
    const newSelected = new Set(selectedSuggestions);
    if (newSelected.has(partId)) {
      newSelected.delete(partId);
    } else {
      newSelected.add(partId);
    }
    setSelectedSuggestions(newSelected);
  };

  const addCustomPart = () => {
    if (!newPart.type || !newPart.number) {
      return;
    }

    setCustomParts([...customParts, newPart]);
    setNewPart({ type: '', number: '', brand: '', notes: '' });
    setShowAddCustom(false);
  };

  const removeCustomPart = (index: number) => {
    setCustomParts(customParts.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Parts Used (Optional)</h3>

        {/* Toggle: My Parts vs Community */}
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => setMyPartsOnly(false)}
            className={`px-3 py-1 rounded ${!myPartsOnly ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Community
          </button>
          <button
            onClick={() => setMyPartsOnly(true)}
            className={`px-3 py-1 rounded ${myPartsOnly ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            My Parts Only
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading suggestions...</p>
      ) : (
        <>
          {/* Suggested Parts */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 font-medium">Suggested Parts:</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {suggestions.map((part) => (
                  <label
                    key={part.id}
                    className={`flex items-start p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                      selectedSuggestions.has(part.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSuggestions.has(part.id)}
                      onChange={() => toggleSuggestion(part.id)}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">{part.part_type}:</span>
                        <span className="text-gray-700">{part.part_number}</span>
                        {part.brand && <span className="text-gray-500 text-sm">({part.brand})</span>}
                        {part.verified && <span className="text-green-600 text-xs">✅ Verified</span>}
                        {!part.verified && <span className="text-blue-600 text-xs">🆕 New</span>}
                        {part.isPersonal && <span className="text-purple-600 text-xs">👤 Your Part</span>}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Used {part.times_used} {part.times_used === 1 ? 'time' : 'times'}
                        {part.notes && ` • ${part.notes}`}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Custom Parts */}
          {customParts.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 font-medium">Custom Parts Added:</p>
              {customParts.map((part, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border border-gray-200 rounded bg-gray-50">
                  <div className="flex-1">
                    <div>
                      <span className="font-medium text-gray-800">{part.type}:</span>{' '}
                      <span className="text-gray-700">{part.number}</span>
                      {part.brand && <span className="text-gray-500 text-sm"> ({part.brand})</span>}
                    </div>
                    {part.notes && (
                      <p className="text-xs text-gray-600 italic mt-1">{part.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeCustomPart(index)}
                    className="text-red-600 hover:text-red-800"
                    title="Remove"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Custom Part Button */}
          {!showAddCustom && (
            <button
              onClick={() => setShowAddCustom(true)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Custom Part
            </button>
          )}

          {/* Add Custom Part Form */}
          {showAddCustom && (
            <div className="p-4 border border-gray-300 rounded bg-gray-50 space-y-3">
              <h4 className="font-medium text-gray-800">Add Custom Part</h4>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={newPart.type}
                  onChange={(e) => setNewPart({ ...newPart, type: e.target.value })}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value="">Part Type</option>
                  {COMMON_PART_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newPart.number}
                  onChange={(e) => setNewPart({ ...newPart, number: e.target.value })}
                  placeholder="Part Number"
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                />
                <input
                  type="text"
                  value={newPart.brand || ''}
                  onChange={(e) => setNewPart({ ...newPart, brand: e.target.value })}
                  placeholder="Brand (optional)"
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                />
              </div>
              <input
                type="text"
                value={newPart.notes || ''}
                onChange={(e) => setNewPart({ ...newPart, notes: e.target.value })}
                placeholder="Notes (optional, e.g., 'Aftermarket performance filter')"
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={addCustomPart}
                  disabled={!newPart.type || !newPart.number}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add Part
                </button>
                <button
                  onClick={() => {
                    setShowAddCustom(false);
                    setNewPart({ type: '', number: '', brand: '', notes: '' });
                  }}
                  className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {suggestions.length === 0 && customParts.length === 0 && !showAddCustom && (
            <p className="text-gray-500 text-sm italic">
              No suggestions available. Be the first to add parts for this vehicle!
            </p>
          )}
        </>
      )}
    </div>
  );
};
