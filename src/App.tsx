import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Inventory } from './pages/Inventory';
import { Dashboard } from './pages/Dashboard';
import { VehicleDetails } from './pages/VehicleDetails';
import { Protocols } from './pages/Protocols';
import { ProtectedPage } from './components/ProtectedPage';
import { supabase } from './lib/supabaseClient';

function App() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Vehicle Maintenance Tracker</h1>
          <div className="space-x-4">
            <Link to="/" className="text-blue-500 hover:underline">
              Dashboard
            </Link>
            <Link to="/inventory" className="text-blue-500 hover:underline">
              Inventory
            </Link>
            <Link to="/protocols" className="text-blue-500 hover:underline">
              Protocols
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Routes */}
        <main className="p-6">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedPage>
                  <Dashboard />
                </ProtectedPage>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedPage>
                  <Inventory />
                </ProtectedPage>
              }
            />
            <Route
              path="/vehicle/:id"
              element={
                <ProtectedPage>
                  <VehicleDetails />
                </ProtectedPage>
              }
            />
            <Route
              path="/protocols"
              element={
                <ProtectedPage>
                  <Protocols />
                </ProtectedPage>
              }
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
