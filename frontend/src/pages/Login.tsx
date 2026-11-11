import React, { useState } from 'react';
import { supabase, isSupabaseConfigured, localAuth } from '../services/supabaseClient';
import { StudentProfile } from '../types';
import { LogIn, AlertCircle } from 'lucide-react';

interface LoginProps {
  onSuccess: (user: StudentProfile) => void;
  onNavigate: (view: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide your university email and password.');
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (signInError) throw signInError;

        if (data.user) {
          const profile: StudentProfile = {
            id: data.user.id,
            full_name: data.user.user_metadata?.full_name || 'Presidency Student',
            email: data.user.email || email.trim(),
            usn: data.user.user_metadata?.usn
          };
          localAuth.setUser(profile);
          onSuccess(profile);
          return;
        }
      } else {
        // Fallback demo sign-in
        const existing = localAuth.getUser();
        const profile: StudentProfile = existing || {
          id: `std_${Date.now()}`,
          full_name: email.split('@')[0].toUpperCase(),
          email: email.trim(),
          usn: 'PU-DEMO-2024'
        };
        localAuth.setUser(profile);
        onSuccess(profile);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-200">
        <div className="text-center mb-6">
          <img
            src="/assets/presidency-logo.svg"
            alt="Presidency University"
            className="h-12 mx-auto mb-4 object-contain"
          />
          <h2 className="text-2xl font-extrabold text-slate-900">Student Sign In</h2>
          <p className="text-xs text-slate-500 mt-1">Presidency University AI Campus Helpdesk</p>
        </div>

        {error && (
          <div className="mb-5 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">University Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@presidencyuniversity.in"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0B1E3D] hover:bg-blue-900 text-white font-semibold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 text-sm mt-4 cursor-pointer disabled:opacity-60"
          >
            <LogIn className="w-4 h-4 text-amber-400" />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="text-blue-700 font-semibold hover:underline"
          >
            Register here
          </button>
        </div>
      </div>
    </div>
  );
};
