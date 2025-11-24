import React, { useState } from 'react';
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
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            {/* Top row: Logo/Brand and Logout */}
            <div className="flex justify-between items-center py-3 border-b border-white/10">
              {/* Logo and brand */}
              <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none">
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
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Upshift</h1>
                  <p className="text-xs text-blue-100 hidden sm:block">Vehicle Maintenance Tracker</p>
                </div>
              </Link>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition text-xs sm:text-sm"
              >
                Logout
              </button>
            </div>

            {/* Bottom row: Navigation links */}
            <nav className="flex items-center justify-start gap-1 sm:gap-2 py-2 overflow-x-auto">
              <Link
                to="/"
                className="text-white hover:bg-white/20 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium transition text-xs sm:text-sm whitespace-nowrap"
              >
                Dashboard
              </Link>
              <Link
                to="/inventory"
                className="text-white hover:bg-white/20 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium transition text-xs sm:text-sm whitespace-nowrap"
              >
                Inventory
              </Link>
              <Link
                to="/protocols"
                className="text-white hover:bg-white/20 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium transition text-xs sm:text-sm whitespace-nowrap"
              >
                Protocols
              </Link>
            </nav>
          </div>
        </header>

        {/* Routes */}
        <main className="p-3 sm:p-6">
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
