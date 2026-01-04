import { Schema, model } from "mongoose";
import { 
  IJobApplication, 
  IStatusHistoryEntry, 
  IInterviewSchedule,
  ApplicationStatusType,
  InterviewType,
  InterviewStatus
} from "./Jobaplications.interfaces";

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * JOB APPLICATION MODEL - Production Grade
 * ═══════════════════════════════════════════════════════════════════════════════
 * Enterprise-level schema with full audit trail and interview scheduling
 */

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS FOR VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

const APPLICATION_STATUSES: ApplicationStatusType[] = [
  "Pending",
  "Reviewed", 
  "Shortlisted",
  "Interview Scheduled",
  "Interview Completed",
  "Selected",
  "Rejected",
  "Offer Extended",
  "Offer Accepted",
  "Offer Declined",
  "Withdrawn"
];

const INTERVIEW_TYPES: InterviewType[] = [
  "Online",
  "Offline",
  "Phone",
  "Technical",
  "HR",
  "Final"
];

const INTERVIEW_STATUSES: InterviewStatus[] = [
  "Scheduled",
  "Completed",
  "Cancelled",
  "Rescheduled",
  "No Show"
];

// ─────────────────────────────────────────────────────────────────────────────
// STATUS HISTORY SUB-SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

const statusHistorySchema = new Schema<IStatusHistoryEntry>({
  status: { 
    type: String, 
    enum: APPLICATION_STATUSES,
    required: true 
  },
  changedAt: { 
    type: Date, 
    default: Date.now,
    required: true 
  },
  changedBy: { 
    type: Schema.Types.ObjectId, 
    ref: "User" 
  },
  notes: { type: String },
  notificationSent: { type: Boolean, default: false },
  notificationError: { type: String }
}, { _id: true });

// ─────────────────────────────────────────────────────────────────────────────
// INTERVIEW SCHEDULE SUB-SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

const interviewScheduleSchema = new Schema<IInterviewSchedule>({
  type: { 
    type: String, 
    enum: INTERVIEW_TYPES,
    required: true 
  },
  status: { 
    type: String, 
    enum: INTERVIEW_STATUSES,
    default: "Scheduled" 
  },
  
  // Scheduling Details
  scheduledDate: { type: Date, required: true },
  scheduledTime: { type: String, required: true },
  duration: { type: Number, default: 60 },
  timezone: { type: String, default: "Asia/Dhaka" },
  
  // Online Meeting Details
  isOnline: { type: Boolean, required: true },
  meetingLink: { type: String },
  meetingPlatform: { 
    type: String, 
    enum: ["Zoom", "Google Meet", "Microsoft Teams", "Other"] 
  },
  meetingId: { type: String },
  meetingPassword: { type: String },
  
  // Offline Meeting Details
  location: { type: String },
  roomNumber: { type: String },
  contactPerson: { type: String },
  contactPhone: { type: String },
  
  // Interviewers
  interviewers: [{
    name: { type: String, required: true },
    email: { type: String },
    designation: { type: String }
  }],
  
  // Notes & Instructions
  instructions: { type: String },
  internalNotes: { type: String },
  
  // Feedback
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    strengths: [{ type: String }],
    improvements: [{ type: String }],
    recommendation: { 
      type: String, 
      enum: ["Hire", "Reject", "Next Round", "Hold"] 
    },
    comments: { type: String },
    submittedBy: { type: Schema.Types.ObjectId, ref: "User" },
    submittedAt: { type: Date }
  },
  
  // Reschedule History
  rescheduleHistory: [{
    previousDate: { type: Date, required: true },
    previousTime: { type: String, required: true },
    reason: { type: String, required: true },
    rescheduledBy: { type: Schema.Types.ObjectId, ref: "User" },
    rescheduledAt: { type: Date, default: Date.now }
  }]
}, { _id: true, timestamps: true });

// ─────────────────────────────────────────────────────────────────────────────
// EVALUATION SUB-SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

const evaluationSchema = new Schema({
  evaluatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  evaluatedAt: { type: Date, default: Date.now },
  scores: {
    technicalSkills: { type: Number, min: 1, max: 10 },
    communication: { type: Number, min: 1, max: 10 },
    experience: { type: Number, min: 1, max: 10 },
    cultureFit: { type: Number, min: 1, max: 10 },
    overall: { type: Number, min: 1, max: 10 }
  },
  recommendation: { 
    type: String, 
    enum: ["Strong Hire", "Hire", "No Hire", "Strong No Hire"] 
  },
  comments: { type: String }
}, { _id: true });

// ─────────────────────────────────────────────────────────────────────────────
// OFFER DETAILS SUB-SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

const offerDetailsSchema = new Schema({
  salary: { type: Number },
  currency: { type: String, default: "BDT" },
  joiningDate: { type: Date },
  offerLetterUrl: { type: String },
  offerSentAt: { type: Date },
  offerExpiresAt: { type: Date },
  responseReceivedAt: { type: Date },
  negotiationNotes: { type: String }
}, { _id: false });

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APPLICATION SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

const jobApplicationSchema = new Schema<IJobApplication>(
  {
    // Job and User Reference
    jobId: { 
      type: Schema.Types.ObjectId, 
      ref: "Job", 
      required: true,
      index: true
    },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true
    },
    
    // Current Status
    applicationStatus: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: "Pending",
      index: true
    },
    
    // Status History - Complete audit trail
    statusHistory: {
      type: [statusHistorySchema],
      default: []
    },
    
    // Interview Scheduling
    interviews: [interviewScheduleSchema],
    currentInterview: interviewScheduleSchema,
    
    // Recruiter Notes
    internalNotes: { type: String },
    
    // Applicant Cover Letter
    coverLetter: { type: String },
    
    // Evaluations
    evaluations: [evaluationSchema],
    
    // Offer Details
    offerDetails: offerDetailsSchema,
    
    // Metadata
    source: { type: String },
    referralCode: { type: String },
    resumeVersion: { type: Number, default: 1 },
    
    // Activity Tracking
    appliedAt: { type: Date, default: Date.now },
    lastActivityAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// INDEXES FOR PERFORMANCE
// ─────────────────────────────────────────────────────────────────────────────

jobApplicationSchema.index({ jobId: 1, userId: 1 }, { unique: true }); // Prevent duplicates
jobApplicationSchema.index({ applicationStatus: 1, appliedAt: -1 });
jobApplicationSchema.index({ "interviews.scheduledDate": 1 });
jobApplicationSchema.index({ "interviews.status": 1 });
jobApplicationSchema.index({ lastActivityAt: -1 });
jobApplicationSchema.index({ createdAt: -1 });

// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE - Auto-update lastActivityAt
// ─────────────────────────────────────────────────────────────────────────────

jobApplicationSchema.pre('save', function(next) {
  this.lastActivityAt = new Date();
  next();
});

jobApplicationSchema.pre('findOneAndUpdate', function(next) {
  this.set({ lastActivityAt: new Date() });
  next();
});

// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE - Auto-add initial status to history
// ─────────────────────────────────────────────────────────────────────────────

jobApplicationSchema.pre('save', function(next) {
  // If this is a new application, add initial status to history
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({
      status: "Pending",
      changedAt: new Date(),
      notes: "Application submitted",
      notificationSent: false
    });
  }
  next();
});

// ─────────────────────────────────────────────────────────────────────────────
// VIRTUALS
// ─────────────────────────────────────────────────────────────────────────────

// Get upcoming interview
jobApplicationSchema.virtual('upcomingInterview').get(function() {
  if (!this.interviews || this.interviews.length === 0) return null;
  
  const now = new Date();
  const upcoming = this.interviews
    .filter(i => i.status === 'Scheduled' && new Date(i.scheduledDate) > now)
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  
  return upcoming[0] || null;
});

// Get days since application
jobApplicationSchema.virtual('daysSinceApplication').get(function() {
  if (!this.appliedAt) return 0;
  const now = new Date();
  const diff = now.getTime() - new Date(this.appliedAt).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Get average evaluation score
jobApplicationSchema.virtual('averageScore').get(function() {
  if (!this.evaluations || this.evaluations.length === 0) return null;
  
  const scores = this.evaluations
    .filter(e => e.scores?.overall)
    .map(e => e.scores!.overall!);
  
  if (scores.length === 0) return null;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
});

export const JobApplication = model<IJobApplication>("JobApplication", jobApplicationSchema);
