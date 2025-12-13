import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface UserSettings {
  distance_unit: 'miles' | 'kilometers';
  fuel_unit: 'gallons' | 'liters';
  temperature_unit: 'fahrenheit' | 'celsius';
  date_format: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  email_notifications: boolean;
  maintenance_reminders: boolean;
}

interface SettingsContextType {
  settings: UserSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: UserSettings = {
  distance_unit: 'miles',
  fuel_unit: 'gallons',
  temperature_unit: 'fahrenheit',
  date_format: 'MM/DD/YYYY',
  email_notifications: true,
  maintenance_reminders: true,
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
});

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSettings(defaultSettings);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If no settings exist, create default ones
        if (error.code === 'PGRST116') {
          await createDefaultSettings(user.id);
          setSettings(defaultSettings);
        } else {
          console.error('Error loading settings:', error);
          setSettings(defaultSettings);
        }
      } else if (data) {
        setSettings({
          distance_unit: data.distance_unit,
          fuel_unit: data.fuel_unit,
          temperature_unit: data.temperature_unit,
          date_format: data.date_format,
          email_notifications: data.email_notifications,
          maintenance_reminders: data.maintenance_reminders,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSettings = async (userId: string) => {
    try {
      await supabase.from('user_settings').insert({ user_id: userId });
    } catch (error) {
      console.error('Error creating default settings:', error);
    }
  };

  const refreshSettings = async () => {
    setLoading(true);
    await loadSettings();
  };

  useEffect(() => {
    loadSettings();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadSettings();
      } else {
        setSettings(defaultSettings);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
