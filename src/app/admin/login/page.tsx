'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isConfigured, setIsConfigured] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const res = await fetch('/api/admin/session', { cache: 'no-store' });
      const result = await res.json();

      if (typeof result.configured === 'boolean') {
        setIsConfigured(result.configured);
      }

      if (result.authenticated) {
        router.replace('/admin');
      }
    };

    checkSession();
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Login failed');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <div className="w-full max-w-md form-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Admin Login</h1>
        <p className="text-sm text-gray-600 mt-1 mb-5">
          Sign in to access incident form submissions.
        </p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
            {error}
          </div>
        )}

        {!isConfigured && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded-md text-sm">
            Admin login is not configured. Add `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and
            `ADMIN_SESSION_SECRET` in `.env.local`, then restart the server.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              required
              className="form-control px-3 py-2 text-sm"
              placeholder="Enter admin username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              className="form-control px-3 py-2 text-sm"
              placeholder="Enter admin password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full primary-button text-white py-2.5 px-4 rounded-md font-medium text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-[var(--form-accent)] hover:underline">
            Back to report form
          </Link>
        </div>
      </div>
    </div>
  );
}
