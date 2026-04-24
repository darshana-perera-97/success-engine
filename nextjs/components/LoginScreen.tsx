import React, { useState } from 'react';
import { Lock, Mail } from 'lucide-react';
import { Button } from './Button';
import { saveLoginSession } from '../authSession';
import { loginAdmin } from '../authApi';

interface LoginScreenProps {
  onLoggedIn: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setIsLoading(true);
    try {
      const result = await loginAdmin(email.trim(), password);
      if (!result.ok) {
        setError(result.error);
        setIsLoading(false);
        return;
      }
      saveLoginSession();
      onLoggedIn();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB] text-slate-900 font-sans p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex justify-center mb-5">
            <img
              src="/MainLogo.png"
              alt="ABEC Premier"
              className="h-10 w-auto object-contain max-w-[220px]"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="font-semibold text-lg text-[#0F172A] text-center">Sign in</h1>
          <p className="text-xs text-slate-500 mt-0.5 text-center">
            Access your workspace with your ABEC Premier account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error ? (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
              {error}
            </div>
          ) : null}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} strokeWidth={2} />
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@organization.com"
                className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-slate-400" size={16} strokeWidth={2} />
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" defaultChecked />
              Remember me
            </label>
            <button type="button" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Forgot password?
            </button>
          </div>

          <Button type="submit" className="w-full justify-center py-2.5" size="lg" isLoading={isLoading}>
            Sign in
          </Button>

          <p className="text-[11px] text-center text-slate-400 leading-relaxed">
            Sign in with the admin credentials configured on the backend (.env).
          </p>
        </form>
      </div>
    </div>
  );
};
