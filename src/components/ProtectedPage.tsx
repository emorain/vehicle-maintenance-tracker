import { useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { AuthForm } from './AuthForm';
import { User } from '@supabase/supabase-js';

interface ProtectedPageProps {
  children: ReactNode;
}

export const ProtectedPage = ({ children }: ProtectedPageProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) console.error('Error fetching session:', error);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return <p className="text-center mt-6">Loading...</p>;
  if (!user) return <AuthForm />;

  return <>{children}</>;
};
