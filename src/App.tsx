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
      <div className="min-h-screen bg-gray-50">
        {/* Header with Upshift branding */}
        <header className="bg-upshift-gradient shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              {/* Logo and brand */}
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <defs>
                      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{stopColor:'#2563eb'}} />
                        <stop offset="100%" style={{stopColor:'#0891b2'}} />
                      </linearGradient>
                    </defs>
                    <path d="M12 4 L17 10 L15 10 L15 20 L9 20 L9 10 L7 10 Z" fill="url(#logoGradient)"/>
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Upshift</h1>
                  <p className="text-xs text-blue-100 hidden sm:block">Vehicle Maintenance Tracker</p>
                </div>
              </Link>

              {/* Navigation */}
              <nav className="flex items-center gap-2 sm:gap-4">
                <Link
                  to="/"
                  className="text-white hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition"
                >
                  Dashboard
                </Link>
                <Link
                  to="/inventory"
                  className="text-white hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition"
                >
                  Inventory
                </Link>
                <Link
                  to="/protocols"
                  className="text-white hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition"
                >
                  Protocols
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  Logout
                </button>
              </nav>
            </div>
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
