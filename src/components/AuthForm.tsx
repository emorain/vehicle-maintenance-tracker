// src/components/AuthForm.tsx
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Toast } from './Toast';

type AuthMode = 'login' | 'signup' | 'forgot-password';

export const AuthForm = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const validatePassword = (pass: string): string | null => {
    if (pass.length < 6) return 'Password must be at least 6 characters';
    if (!/\d/.test(pass)) return 'Password must contain at least one number';
    return null;
  };

  const handleSignup = async (e: React.FormEvent) => {
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

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}`,
      },
    });

    setLoading(false);

    if (error) {
      setToast({ message: error.message, type: 'error' });
    } else {
      setToast({
        message: 'Success! Check your email to verify your account.',
        type: 'success'
      });
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      // Switch to login mode after successful signup
      setTimeout(() => setMode('login'), 3000);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        setToast({
          message: 'Please verify your email before logging in. Check your inbox.',
          type: 'error'
        });
      } else {
        setToast({ message: error.message, type: 'error' });
      }
    } else {
      setToast({ message: 'Login successful!', type: 'success' });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setToast({ message: 'Please enter your email address', type: 'error' });
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      setToast({ message: error.message, type: 'error' });
    } else {
      setToast({
        message: 'Password reset link sent! Check your email.',
        type: 'success'
      });
      setTimeout(() => setMode('login'), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (mode === 'signup') return handleSignup(e);
    if (mode === 'login') return handleLogin(e);
    if (mode === 'forgot-password') return handleForgotPassword(e);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-4"
      >
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-blue-600">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'forgot-password' && 'Reset Password'}
          </h2>
          <p className="text-gray-600 mt-2">
            {mode === 'login' && 'Sign in to manage your vehicles'}
            {mode === 'signup' && 'Start tracking your vehicle maintenance'}
            {mode === 'forgot-password' && 'Enter your email to receive a reset link'}
          </p>
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Password Field (not shown for forgot password) */}
        {mode !== 'forgot-password' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {mode === 'signup' && (
              <p className="text-xs text-gray-500 mt-1">
                At least 6 characters with one number
              </p>
            )}
          </div>
        )}

        {/* Confirm Password Field (only for signup) */}
        {mode === 'signup' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
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
        )}

        {/* Forgot Password Link (only show on login) */}
        {mode === 'login' && (
          <div className="text-right">
            <button
              type="button"
              onClick={() => setMode('forgot-password')}
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot Password?
            </button>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
          disabled={loading}
        >
          {loading && 'Processing...'}
          {!loading && mode === 'login' && 'Sign In'}
          {!loading && mode === 'signup' && 'Create Account'}
          {!loading && mode === 'forgot-password' && 'Send Reset Link'}
        </button>

        {/* Mode Toggle */}
        <div className="text-center pt-4 border-t">
          {mode === 'login' && (
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="text-blue-600 font-semibold hover:underline"
              >
                Sign Up
              </button>
            </p>
          )}

          {mode === 'signup' && (
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-blue-600 font-semibold hover:underline"
              >
                Sign In
              </button>
            </p>
          )}

          {mode === 'forgot-password' && (
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-blue-600 font-semibold hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};
