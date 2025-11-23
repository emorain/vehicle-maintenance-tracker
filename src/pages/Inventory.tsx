// src/pages/Inventory.tsx
import { useState } from 'react';
import { VehicleForm } from '../components/VehicleForm';
import { VehicleList } from '../components/VehicleList';

export const Inventory = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddVehicle = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Vehicle Inventory</h1>
      <VehicleForm onAdd={handleAddVehicle} />
      <VehicleList refreshKey={refreshKey} /> {/* Pass refreshKey as prop */}
    </div>
  );
};
