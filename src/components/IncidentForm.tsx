'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import SafetyMap, { Incident } from '@/components/SafetyMap';

const incidentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Please provide more details (min 10 characters)').max(1000),
  incidentType: z.enum(['robbery', 'accident', 'assault', 'harassment', 'other']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  dateTime: z.string(),
  reporterName: z.string().max(50).optional(),
  reporterContact: z.string().max(50).optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional(),
  }),
});

type IncidentFormData = z.infer<typeof incidentSchema>;

interface IncidentFormProps {
  incidents: Incident[];
  selectedLocation: { lat: number; lng: number } | null;
  onLocationSelect: (lat: number, lng: number) => void;
  onSubmitSuccess: () => void;
}

export default function IncidentForm({
  incidents,
  selectedLocation,
  onLocationSelect,
  onSubmitSuccess,
}: IncidentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      dateTime: new Date().toISOString().slice(0, 16),
    },
  });

  useEffect(() => {
    if (selectedLocation) {
      setValue('location', selectedLocation, { shouldValidate: true });
    }
  }, [selectedLocation, setValue]);

  const onSubmit = async (data: IncidentFormData) => {
    if (!selectedLocation) {
      setSubmitError('Please select a location on the map first');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      const payload = {
        ...data,
        location: selectedLocation,
      };

      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit incident');
      }

      setSubmitSuccess(true);
      reset();
      onSubmitSuccess();

      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An error occurred while submitting';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const incidentTypes = [
    { value: 'robbery', label: 'Robbery / Theft', icon: '💰' },
    { value: 'accident', label: 'Accident', icon: '🚗' },
    { value: 'assault', label: 'Assault / Violence', icon: '👊' },
    { value: 'harassment', label: 'Harassment', icon: '🚨' },
    { value: 'other', label: 'Other', icon: '⚠️' },
  ];

  const severityLevels = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
          {submitError}
        </div>
      )}

      {submitSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-md text-sm">
          ✅ Incident reported successfully! Thank you for helping keep the community safe.
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <input
          {...register('title')}
          type="text"
          placeholder="e.g., Robbery at Kalshi Mor"
          className="form-control px-3 py-2 text-sm"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Incident Type *
        </label>
        <select
          {...register('incidentType')}
          className="form-control px-3 py-2 text-sm"
        >
          <option value="">Select incident type</option>
          {incidentTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.icon} {type.label}
            </option>
          ))}
        </select>
        {errors.incidentType && (
          <p className="text-red-500 text-sm mt-1">{errors.incidentType.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Severity *
        </label>
        <select
          {...register('severity')}
          className="form-control px-3 py-2 text-sm"
        >
          <option value="">Select severity level</option>
          {severityLevels.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
        {errors.severity && (
          <p className="text-red-500 text-sm mt-1">{errors.severity.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date & Time *
        </label>
        <input
          {...register('dateTime')}
          type="datetime-local"
          className="form-control px-3 py-2 text-sm"
        />
        {errors.dateTime && (
          <p className="text-red-500 text-sm mt-1">{errors.dateTime.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Incident Location *
        </label>
        <div className="border border-[var(--form-border)] rounded-md p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            {selectedLocation ? (
              <span className="text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full">
                Selected
              </span>
            ) : (
              <span className="text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-full">
                Tap map to set
              </span>
            )}
          </div>

          <div className="h-56 sm:h-64 rounded-md overflow-hidden border border-[var(--form-border)]">
            <SafetyMap
              incidents={incidents}
              selectedLocation={selectedLocation}
              onMapClick={onLocationSelect}
              height="100%"
            />
          </div>

          <p className="text-xs text-gray-600">
            Click or tap on the map to pin the exact incident location.
          </p>

          {selectedLocation && (
            <p className="text-xs text-gray-700">
              Coordinates: {selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}
            </p>
          )}

          {errors.location && (
            <p className="text-red-500 text-sm">Please select a location on the map</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          {...register('description')}
          rows={4}
          placeholder="Describe what happened, any suspects, vehicles involved, etc."
          className="form-control px-3 py-2 text-sm resize-none"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      <div className="border-t border-[var(--form-border)] pt-4">
        <p className="text-sm text-gray-600 font-medium mb-2.5">
          Reporter Information (Optional)
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <input
            {...register('reporterName')}
            type="text"
            placeholder="Anonymous"
            className="form-control px-3 py-2 text-sm"
          />
        </div>

        <div className="mt-2.5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact Info (Optional, for follow-up)
          </label>
          <input
            {...register('reporterContact')}
            type="text"
            placeholder="Phone or email"
            className="form-control px-3 py-2 text-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !selectedLocation}
        className="w-full primary-button text-white py-2.5 px-4 rounded-md font-medium text-sm
          disabled:bg-gray-400 disabled:cursor-not-allowed
          transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Submitting...
          </>
        ) : (
          'Submit Incident Report'
        )}
      </button>
    </form>
  );
}
