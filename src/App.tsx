import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Inventory } from './pages/Inventory';
import { Dashboard } from './pages/Dashboard';
import { VehicleDetails } from './pages/VehicleDetails';
import { Protocols } from './pages/Protocols';
import { ResetPassword } from './pages/ResetPassword';
import { BulkImport } from './pages/BulkImport';
import { Settings } from './pages/Settings';
import { ProtectedPage } from './components/ProtectedPage';
import { HeaderNav } from './components/HeaderNav';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {/* Header with Upshift branding */}
        <HeaderNav />

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
              path="/reset-password"
              element={<ResetPassword />}
            />
            <Route
              path="/bulk-import"
              element={
                <ProtectedPage>
                  <BulkImport />
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
            <Route
              path="/settings"
              element={
                <ProtectedPage>
                  <Settings />
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
