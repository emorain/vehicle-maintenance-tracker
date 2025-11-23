Absolutely! Here’s a **ready-to-paste version** of the reference document you can put directly in `Project_reference.md`:

```markdown
# Vehicle Maintenance Tracker — Project Reference

## 1. Project Overview
**Vehicle Maintenance Tracker** is a TypeScript + React app for managing vehicle inventory and maintenance.  
- Multi-user support with Supabase authentication (planned)  
- Dashboard to visualize vehicles and maintenance status  
- CRUD operations on vehicles using Supabase PostgreSQL  
- Optional image upload via URL or Supabase Storage  

---

## 2. Technology Stack
| Layer            | Technology / Library                  |
|-----------------|--------------------------------------|
| Frontend         | React 18, TypeScript, Vite          |
| Styling          | TailwindCSS 3.x                      |
| Backend / DB     | Supabase (PostgreSQL)                |
| State Management | React `useState` / props             |
| API / Services   | Supabase client SDK                   |
| Routing          | react-router-dom                      |
| Linting          | ESLint + eslint-plugin-react-hooks   |
| Build Tool       | Vite                                  |

---

## 3. Folder Structure

```

src/
├─ components/
│  ├─ VehicleForm.tsx
│  ├─ VehicleList.tsx
│  ├─ VehicleCard.tsx
├─ pages/
│  ├─ Dashboard.tsx
│  ├─ Inventory.tsx
├─ services/
│  └─ VehicleService.ts
├─ types/
│  └─ Vehicle.ts
├─ lib/
│  └─ supabaseClient.ts
├─ index.tsx
├─ App.tsx

```

---

## 4. Supabase Database Schema

**Table: `vehicles`**

| Column       | Type      | Notes                         |
|-------------|-----------|-------------------------------|
| id          | UUID      | Primary Key                    |
| user_id     | UUID      | References Supabase auth user  |
| name        | TEXT      | Vehicle name / model           |
| make        | TEXT      | Manufacturer / brand           |
| year        | INTEGER   | Model year                     |
| vin         | TEXT      | Optional VIN number            |
| notes       | TEXT      | Optional notes                 |
| image_url   | TEXT      | Optional image URL             |
| created_at  | TIMESTAMP | Defaults to `now()`            |
| updated_at  | TIMESTAMP | Auto-updated on change         |

---

## 5. Environment Variables (`.env`)

```

VITE_SUPABASE_URL=[https://your-project-id.supabase.co](https://your-project-id.supabase.co)
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

````

- `VITE_` prefix is required for client-side variables  
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret  

---

## 6. Supabase Client (`lib/supabaseClient.ts`)

```ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
````

---

## 7. Types (`types/Vehicle.ts`)

```ts
export interface Vehicle {
  id: string;
  user_id: string;
  name: string;
  make: string;
  year: number;
  vin?: string;
  notes?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}
```

---

## 8. Vehicle Service (`services/VehicleService.ts`)

```ts
import { supabase } from '../lib/supabaseClient';
import { Vehicle } from '../types/Vehicle';

export const VehicleService = {
  async getVehicles(): Promise<Vehicle[]> {
    const { data, error } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async getVehicleById(id: string): Promise<Vehicle | null> {
    const { data, error } = await supabase.from('vehicles').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  },

  async addVehicle(vehicle: Partial<Vehicle>): Promise<Vehicle> {
    const { data, error } = await supabase.from('vehicles').insert([vehicle]).select().maybeSingle();
    if (error) throw error;
    return data!;
  },

  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<Vehicle> {
    const { data, error } = await supabase.from('vehicles').update(updates).eq('id', id).select().maybeSingle();
    if (error) throw error;
    return data!;
  },

  async deleteVehicle(id: string): Promise<void> {
    const { error } = await supabase.from('vehicles').delete().eq('id', id);
    if (error) throw error;
  },
};
```

---

## 9. Vehicle Form (`components/VehicleForm.tsx`)

```ts
import { useState, ChangeEvent, FormEvent } from 'react';
import { VehicleService } from '../services/VehicleService';

interface VehicleFormProps { onAdd: () => void }

export const VehicleForm = ({ onAdd }: VehicleFormProps) => {
  const [vehicle, setVehicle] = useState({ name:'', make:'', year:'', vin:'', notes:'', image_url:'' });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setVehicle(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await VehicleService.addVehicle({ ...vehicle, year: vehicle.year ? Number(vehicle.year) : undefined });
      setVehicle({ name:'', make:'', year:'', vin:'', notes:'', image_url:'' });
      onAdd();
    } catch (err) {
      console.error(err); alert('Failed to add vehicle.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
      <input name="name" placeholder="Vehicle Name / Model" value={vehicle.name} onChange={handleChange} required className="w-full border p-2 rounded" />
      <input name="make" placeholder="Make" value={vehicle.make} onChange={handleChange} required className="w-full border p-2 rounded" />
      <input name="year" placeholder="Year" value={vehicle.year} onChange={handleChange} className="w-full border p-2 rounded" />
      <input name="vin" placeholder="VIN (optional)" value={vehicle.vin} onChange={handleChange} className="w-full border p-2 rounded" />
      <textarea name="notes" placeholder="Notes" value={vehicle.notes} onChange={handleChange} className="w-full border p-2 rounded" />
      <input type="url" name="image_url" placeholder="Image URL" value={vehicle.image_url} onChange={handleChange} className="w-full border p-2 rounded" />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Add Vehicle</button>
    </form>
  );
};
```

---

## 10. Vehicle List (`components/VehicleList.tsx`)

```ts
import { useEffect, useState } from 'react';
import { VehicleService } from '../services/VehicleService';
import { Vehicle } from '../types/Vehicle';

interface VehicleListProps { refreshKey?: number }

export const VehicleList = ({ refreshKey }: VehicleListProps) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = async () => {
    setLoading(true); setError(null);
    try { setVehicles(await VehicleService.getVehicles()); }
    catch(err: any) { console.error(err); setError('Failed to load vehicles.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchVehicles(); }, [refreshKey]);

  if (loading) return <p>Loading vehicles...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!vehicles.length) return <p>No vehicles in inventory yet.</p>;

  return (
    <div className="space-y-4">
      {vehicles.map(vehicle => (
        <div key={vehicle.id} className="border p-4 rounded shadow">
          <h2 className="font-bold text-lg">{vehicle.name}</h2>
          <p>Make: {vehicle.make}</p>
          <p>Year: {vehicle.year}</p>
          {vehicle.vin && <p>VIN: {vehicle.vin}</p>}
          {vehicle.notes && <p>Notes: {vehicle.notes}</p>}
          {vehicle.image_url && <img src={vehicle.image_url} alt={vehicle.name} className="mt-2 max-w-xs" />}
        </div>
      ))}
    </div>
  );
};
```

---

## 11. Inventory Page (`pages/Inventory.tsx`)

```ts
import { useState } from 'react';
import { VehicleForm } from '../components/VehicleForm';
import { VehicleList } from '../components/VehicleList';

export const Inventory = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const handleAddVehicle = () => setRefreshKey(prev => prev + 1);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Vehicle Inventory</h1>
      <VehicleForm onAdd={handleAddVehicle} />
      <VehicleList refreshKey={refreshKey} />
    </div>
  );
};
```

---

## 12. Dashboard (`pages/Dashboard.tsx`)

```ts
import React from 'react';
import { VehicleCard } from '../components/VehicleCard';

export const Dashboard = () => {
  const vehicles = [
    { name: 'Truck A', type: 'Truck', lastMaintenance: '2025-11-01' },
    { name: 'Quad B', type: 'Quad', lastMaintenance: '2025-10-15' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Vehicle Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vehicles.map((v, i) => (
          <VehicleCard key={i} {...v} />
        ))}
      </div>
    </div>
  );
};
```

---

## 13. App Routing (`index.tsx` / `App.tsx`)

```ts
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Inventory } from './pages/Inventory';
import { Dashboard } from './pages/Dashboard';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
```

---

## 14. Common TypeScript & Supabase Issues

* `Expected 2 type arguments, but got 1` → Only provide the row type in `.from<RowType>()`
* `Type instantiation is excessively deep` → Remove double generics
* `ImportMeta.env` errors → Ensure `VITE_` prefix and `import.meta.env.VITE_KEY`
* File casing issues → Ensure folder/file names match exactly
* `.maybeSingle()` fixes `.single()` type mismatches

---

## 15. Future Enhancements

* Supabase Authentication & RLS for multi-user support
* Maintenance logs per vehicle
* Image upload via Supabase Storage
* Dashboard metrics & charts
* Mobile responsive layout
* Filtering, sorting, and search for vehicles

```

---

If you want, I can also make a **smaller one-page diagram** version showing **components, pages, services, and data flow** that you could paste into the repo as a visual reference.  

Do you want me to do that next?
```
