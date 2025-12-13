import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Toast } from '../components/Toast';

export const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we're in password recovery mode
    const checkRecoveryMode = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      // If there's a session, it might be a recovery session
      if (session) {
        setIsRecoveryMode(true);
      } else {
        // No session means invalid/expired link
        setToast({
          message: 'Invalid or expired password reset link. Please request a new one.',
          type: 'error'
        });
        setTimeout(() => navigate('/'), 3000);
      }
    };

    checkRecoveryMode();

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [navigate]);

  const validatePassword = (pass: string): string | null => {
    if (pass.length < 6) return 'Password must be at least 6 characters';
    if (!/\d/.test(pass)) return 'Password must contain at least one number';
    return null;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (password !== confirmPassword) {
      setToast({ message: 'Passwords do not match', type: 'error' });
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setToast({ message: passwordError, type: 'error' });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (error) {
      setToast({ message: error.message, type: 'error' });
    } else {
      setToast({
        message: 'Password updated successfully! Redirecting to login...',
        type: 'success'
      });

      // Sign out the user and redirect to login
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate('/');
      }, 2000);
    }
  };

  if (!isRecoveryMode) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <p className="text-center text-gray-600">Validating reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <form
        onSubmit={handleResetPassword}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-4"
      >
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-blue-600">Set New Password</h2>
          <p className="text-gray-600 mt-2">
            Enter your new password below
          </p>
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            At least 6 characters with one number
          </p>
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
          disabled={loading}
        >
          {loading ? 'Updating Password...' : 'Update Password'}
        </button>

        {/* Back to Login */}
        <div className="text-center pt-4 border-t">
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-blue-600 font-semibold hover:underline"
            >
              Back to Login
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};
