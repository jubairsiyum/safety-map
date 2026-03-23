import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IIncident extends Document {
  title: string;
  description: string;
  incidentType: 'robbery' | 'accident' | 'assault' | 'harassment' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  dateTime: Date;
  reporterName?: string;
  reporterContact?: string;
  verified: boolean;
  upvotes: number;
  createdAt: Date;
  updatedAt: Date;
}

const IncidentSchema = new Schema<IIncident>(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      trim: true,
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    incidentType: {
      type: String,
      required: true,
      enum: ['robbery', 'accident', 'assault', 'harassment', 'other'],
    },
    severity: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'critical'],
    },
    location: {
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
      address: {
        type: String,
        trim: true,
      },
    },
    dateTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    reporterName: {
      type: String,
      trim: true,
    },
    reporterContact: {
      type: String,
      trim: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for geospatial queries
IncidentSchema.index({ 'location.lat': 1, 'location.lng': 1 });

// Get or create the model
const Incident: Model<IIncident> =
  mongoose.models.Incident || mongoose.model('Incident', IncidentSchema);

export default Incident;
