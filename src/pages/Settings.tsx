import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Toast } from '../components/Toast';
import { useSettings } from '../contexts/SettingsContext';

interface UserSettings {
  distance_unit: 'miles' | 'kilometers';
  fuel_unit: 'gallons' | 'liters';
  temperature_unit: 'fahrenheit' | 'celsius';
  date_format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  email_notifications: boolean;
  maintenance_reminders: boolean;
}

export const Settings = () => {
  const { refreshSettings } = useSettings();
  const [settings, setSettings] = useState<UserSettings>({
    distance_unit: 'miles',
    fuel_unit: 'gallons',
    temperature_unit: 'fahrenheit',
    date_format: 'MM/DD/YYYY',
    email_notifications: true,
    maintenance_reminders: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If no settings exist, create default ones
        if (error.code === 'PGRST116') {
          await createDefaultSettings(user.id);
        } else {
          throw error;
        }
      } else if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setToast({ message: 'Failed to load settings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSettings = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_settings')
        .insert({ user_id: userId });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating default settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_settings')
        .update(settings)
        .eq('user_id', user.id);

      if (error) throw error;

      setToast({ message: 'Settings saved successfully!', type: 'success' });
      // Refresh the settings context so changes appear app-wide
      await refreshSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      setToast({ message: 'Failed to save settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setToast({ message: 'New passwords do not match', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setToast({ message: 'Password must be at least 6 characters', type: 'error' });
      return;
    }

    if (!/\d/.test(newPassword)) {
      setToast({ message: 'Password must contain at least one number', type: 'error' });
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setToast({ message: 'Password changed successfully!', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error changing password:', error);
      setToast({ message: error.message || 'Failed to change password', type: 'error' });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <p className="text-center text-gray-600">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account preferences and security</p>
      </div>

      <div className="space-y-6">
        {/* Measurement Units */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
            Measurement Units
          </h2>

          <div className="space-y-4">
            {/* Distance Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Distance</label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="distance_unit"
                    value="miles"
                    checked={settings.distance_unit === 'miles'}
                    onChange={(e) => setSettings({ ...settings, distance_unit: e.target.value as 'miles' })}
                    className="mr-2"
                  />
                  <span className="text-gray-700">Miles (mi)</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="distance_unit"
                    value="kilometers"
                    checked={settings.distance_unit === 'kilometers'}
                    onChange={(e) => setSettings({ ...settings, distance_unit: e.target.value as 'kilometers' })}
                    className="mr-2"
                  />
                  <span className="text-gray-700">Kilometers (km)</span>
                </label>
              </div>
            </div>

            {/* Fuel Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Volume</label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="fuel_unit"
                    value="gallons"
                    checked={settings.fuel_unit === 'gallons'}
                    onChange={(e) => setSettings({ ...settings, fuel_unit: e.target.value as 'gallons' })}
                    className="mr-2"
                  />
                  <span className="text-gray-700">Gallons (gal)</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="fuel_unit"
                    value="liters"
                    checked={settings.fuel_unit === 'liters'}
                    onChange={(e) => setSettings({ ...settings, fuel_unit: e.target.value as 'liters' })}
                    className="mr-2"
                  />
                  <span className="text-gray-700">Liters (L)</span>
                </label>
              </div>
            </div>

            {/* Temperature Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Temperature</label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="temperature_unit"
                    value="fahrenheit"
                    checked={settings.temperature_unit === 'fahrenheit'}
                    onChange={(e) => setSettings({ ...settings, temperature_unit: e.target.value as 'fahrenheit' })}
                    className="mr-2"
                  />
                  <span className="text-gray-700">Fahrenheit (°F)</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="temperature_unit"
                    value="celsius"
                    checked={settings.temperature_unit === 'celsius'}
                    onChange={(e) => setSettings({ ...settings, temperature_unit: e.target.value as 'celsius' })}
                    className="mr-2"
                  />
                  <span className="text-gray-700">Celsius (°C)</span>
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className={`mt-6 px-6 py-2 rounded-lg font-semibold ${
              saving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>

        {/* Date Format */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Date Format
          </h2>

          <div className="space-y-3">
            {['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].map((format) => (
              <label key={format} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="date_format"
                  value={format}
                  checked={settings.date_format === format}
                  onChange={(e) => setSettings({ ...settings, date_format: e.target.value as any })}
                  className="mr-2"
                />
                <span className="text-gray-700">{format}</span>
                <span className="ml-2 text-sm text-gray-500">
                  (e.g., {format === 'MM/DD/YYYY' ? '12/13/2025' : format === 'DD/MM/YYYY' ? '13/12/2025' : '2025-12-13'})
                </span>
              </label>
            ))}
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className={`mt-6 px-6 py-2 rounded-lg font-semibold ${
              saving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Notifications
          </h2>

          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-medium text-gray-700">Email Notifications</div>
                <div className="text-sm text-gray-500">Receive email updates about your vehicles</div>
              </div>
              <input
                type="checkbox"
                checked={settings.email_notifications}
                onChange={(e) => setSettings({ ...settings, email_notifications: e.target.checked })}
                className="w-5 h-5"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-medium text-gray-700">Maintenance Reminders</div>
                <div className="text-sm text-gray-500">Get notified about upcoming maintenance</div>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenance_reminders}
                onChange={(e) => setSettings({ ...settings, maintenance_reminders: e.target.checked })}
                className="w-5 h-5"
              />
            </label>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className={`mt-6 px-6 py-2 rounded-lg font-semibold ${
              saving
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Change Password
          </h2>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">At least 6 characters with one number</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              className={`px-6 py-2 rounded-lg font-semibold ${
                changingPassword
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {changingPassword ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
