'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Incident } from '@/components/SafetyMap';

// Dynamic import to avoid SSR issues with Leaflet
const SafetyMap = dynamic(() => import('@/components/SafetyMap'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-100 rounded-lg flex items-center justify-center h-[500px]">
      <p className="text-gray-500">Loading map...</p>
    </div>
  ),
});

const IncidentForm = dynamic(() => import('@/components/IncidentForm'), {
  ssr: false,
});

export default function Home() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const fetchIncidents = async () => {
    try {
      const response = await fetch('/api/incidents');
      const result = await response.json();
      if (result.success) {
        setIncidents(result.data);
      }
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
    // Refresh every 30 seconds
    const interval = setInterval(fetchIncidents, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
  };

  const filteredIncidents = incidents.filter((incident) => {
    if (filterType !== 'all' && incident.incidentType !== filterType) return false;
    if (filterSeverity !== 'all' && incident.severity !== filterSeverity) return false;
    return true;
  });

  const getSeverityStats = () => {
    const stats = { critical: 0, high: 0, medium: 0, low: 0 };
    incidents.forEach((i) => {
      stats[i.severity]++;
    });
    return stats;
  };

  const stats = getSeverityStats();

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="form-card px-5 py-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                🛡️ Community Safety Map
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Report and track incidents in your area to keep the community safe
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-600"></span>
                <span className="text-gray-600">{stats.critical} Critical</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-600"></span>
                <span className="text-gray-600">{stats.high} High</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-yellow-600"></span>
                <span className="text-gray-600">{stats.medium} Med</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-600"></span>
                <span className="text-gray-600">{stats.low} Low</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filters */}
            <div className="form-card p-4 shadow-sm">
              <div className="flex flex-wrap gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter by Type
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="form-control px-3 py-2 text-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="robbery">💰 Robbery</option>
                    <option value="accident">🚗 Accident</option>
                    <option value="assault">👊 Assault</option>
                    <option value="harassment">🚨 Harassment</option>
                    <option value="other">⚠️ Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter by Severity
                  </label>
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="form-control px-3 py-2 text-sm"
                  >
                    <option value="all">All Levels</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="ml-auto flex items-end">
                  <p className="text-sm text-gray-600">
                    Showing {filteredIncidents.length} of {incidents.length} incidents
                  </p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="form-card p-3 shadow-sm">
              <SafetyMap
                incidents={filteredIncidents}
                selectedLocation={selectedLocation}
                onMapClick={handleMapClick}
                height="500px"
              />
            </div>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-1">
            <div className="form-card shadow-sm p-5 sticky top-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Report an Incident
              </h2>
              <IncidentForm
                selectedLocation={selectedLocation}
                onSubmitSuccess={fetchIncidents}
              />
            </div>
          </div>
        </div>

        {/* Recent Incidents List */}
        <div className="mt-8 form-card shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--form-border)]">
            <h2 className="text-base font-semibold text-gray-900">
              Recent Reports
            </h2>
          </div>
          <div className="divide-y divide-[var(--form-border)]">
            {isLoading ? (
              <div className="px-6 py-8 text-center text-gray-500">
                Loading incidents...
              </div>
            ) : filteredIncidents.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No incidents reported yet. Be the first to report!
              </div>
            ) : (
              filteredIncidents.slice(0, 10).map((incident) => (
                <div key={incident._id} className="px-6 py-4 hover:bg-blue-50/40">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{incident.title}</h3>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
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
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {incident.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>
                          {new Date(incident.dateTime).toLocaleDateString()} at{' '}
                          {new Date(incident.dateTime).toLocaleTimeString()}
                        </span>
                        <span className="capitalize">{incident.incidentType}</span>
                        {incident.reporterName && (
                          <span>Reported by {incident.reporterName}</span>
                        )}
                      </div>
                    </div>
                    <button
                      className="text-sm text-gray-500 hover:text-[var(--form-accent)] flex items-center gap-1"
                      onClick={() => {
                        setSelectedLocation({
                          lat: incident.location.lat,
                          lng: incident.location.lng,
                        });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      📍 Show on map
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
