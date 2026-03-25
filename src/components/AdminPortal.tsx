'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type AdminIncident = {
  _id: string;
  title: string;
  description: string;
  incidentType: 'robbery' | 'accident' | 'assault' | 'harassment' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  dateTime: string;
  reporterName?: string;
  reporterContact?: string;
  verified: boolean;
  createdAt: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
};

interface AdminPortalProps {
  adminUser: string;
}

type ConnectionMode = 'primary' | 'fallback-local';

export default function AdminPortal({ adminUser }: AdminPortalProps) {
  const router = useRouter();
  const [incidents, setIncidents] = useState<AdminIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('all');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('primary');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/admin/incidents', { cache: 'no-store' });
      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to load submissions');
      }

      setIncidents(result.data);
      if (result.meta?.connectionMode === 'fallback-local') {
        setConnectionMode('fallback-local');
      } else {
        setConnectionMode('primary');
      }
      setLastSyncedAt(new Date());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load submissions';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      if (severity !== 'all' && incident.severity !== severity) {
        return false;
      }

      if (!search.trim()) {
        return true;
      }

      const query = search.toLowerCase();
      return (
        incident.title.toLowerCase().includes(query) ||
        incident.description.toLowerCase().includes(query) ||
        (incident.reporterName || '').toLowerCase().includes(query) ||
        (incident.reporterContact || '').toLowerCase().includes(query)
      );
    });
  }, [incidents, search, severity]);

  const summary = useMemo(() => {
    const counts = {
      total: incidents.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    incidents.forEach((incident) => {
      counts[incident.severity] += 1;
    });

    return counts;
  }, [incidents]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="form-card px-5 py-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Incident Submissions Admin</h1>
              <p className="text-sm text-gray-600 mt-1">
                Logged in as {adminUser}. View all form responses in one place.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center justify-center text-sm px-3 py-2 rounded-md border border-[var(--form-border)] text-gray-700 hover:bg-gray-50"
              >
                Back to Report Form
              </Link>
              <button
                onClick={handleLogout}
                type="button"
                disabled={isLoggingOut}
                className="inline-flex items-center justify-center text-sm px-3 py-2 rounded-md border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-60"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="form-card p-3 shadow-sm">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-semibold text-gray-900">{summary.total}</p>
          </div>
          <div className="form-card p-3 shadow-sm">
            <p className="text-xs text-gray-500">Critical</p>
            <p className="text-lg font-semibold text-red-700">{summary.critical}</p>
          </div>
          <div className="form-card p-3 shadow-sm">
            <p className="text-xs text-gray-500">High</p>
            <p className="text-lg font-semibold text-orange-700">{summary.high}</p>
          </div>
          <div className="form-card p-3 shadow-sm">
            <p className="text-xs text-gray-500">Medium</p>
            <p className="text-lg font-semibold text-yellow-700">{summary.medium}</p>
          </div>
          <div className="form-card p-3 shadow-sm">
            <p className="text-xs text-gray-500">Low</p>
            <p className="text-lg font-semibold text-green-700">{summary.low}</p>
          </div>
        </div>

        <div className="form-card p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, description, reporter..."
              className="form-control px-3 py-2 text-sm flex-1"
            />

            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="form-control px-3 py-2 text-sm sm:w-48"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <button
              onClick={fetchIncidents}
              className="primary-button text-white text-sm px-4 py-2 rounded-md"
              type="button"
            >
              Refresh
            </button>
          </div>

          <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-sm text-gray-600">
              Showing {filteredIncidents.length} of {incidents.length} submissions
            </p>
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full border ${
                  connectionMode === 'fallback-local'
                    ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                    : 'bg-green-50 text-green-800 border-green-200'
                }`}
              >
                DB: {connectionMode === 'fallback-local' ? 'Fallback Local' : 'Primary Atlas'}
              </span>
              {lastSyncedAt && (
                <span className="text-gray-500">
                  Last sync: {lastSyncedAt.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="form-card shadow-sm overflow-hidden">
          {loading ? (
            <div className="px-6 py-8 text-center text-gray-500">Loading submissions...</div>
          ) : error ? (
            <div className="px-6 py-8">
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm">
                <p className="font-medium mb-1">Unable to load admin submissions</p>
                <p>{error}</p>
              </div>
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">No submissions found.</div>
          ) : (
            <div className="divide-y divide-[var(--form-border)]">
              {filteredIncidents.map((incident) => (
                <article key={incident._id} className="px-4 sm:px-6 py-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <h2 className="text-base font-semibold text-gray-900">{incident.title}</h2>
                        <p className="text-xs text-gray-500 mt-1">
                          Submitted: {new Date(incident.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                          {incident.incidentType}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                            incident.severity === 'critical'
                              ? 'bg-red-100 text-red-800'
                              : incident.severity === 'high'
                              ? 'bg-orange-100 text-orange-800'
                              : incident.severity === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {incident.severity}
                        </span>
                        {incident.verified && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Verified
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-700">{incident.description}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
                      <p>
                        <span className="font-medium text-gray-700">Incident Time:</span>{' '}
                        {new Date(incident.dateTime).toLocaleString()}
                      </p>
                      <p>
                        <span className="font-medium text-gray-700">Location:</span>{' '}
                        {incident.location.lat.toFixed(5)}, {incident.location.lng.toFixed(5)}
                      </p>
                      <p>
                        <span className="font-medium text-gray-700">Reporter:</span>{' '}
                        {incident.reporterName || 'Anonymous'}
                      </p>
                      <p>
                        <span className="font-medium text-gray-700">Contact:</span>{' '}
                        {incident.reporterContact || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
