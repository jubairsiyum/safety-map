'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

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

export default function AdminPage() {
  const [incidents, setIncidents] = useState<AdminIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('all');

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/incidents', { cache: 'no-store' });
      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to load submissions');
      }

      setIncidents(result.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load submissions';
      setError(message);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="form-card px-5 py-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Incident Submissions Admin</h1>
              <p className="text-sm text-gray-600 mt-1">
                View all incident form responses in one place.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center justify-center text-sm px-3 py-2 rounded-md border border-[var(--form-border)] text-gray-700 hover:bg-gray-50"
            >
              Back to Report Form
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
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

          <p className="text-sm text-gray-600 mt-3">
            Showing {filteredIncidents.length} of {incidents.length} submissions
          </p>
        </div>

        <div className="form-card shadow-sm overflow-hidden">
          {loading ? (
            <div className="px-6 py-8 text-center text-gray-500">Loading submissions...</div>
          ) : error ? (
            <div className="px-6 py-8 text-center text-red-600">{error}</div>
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
