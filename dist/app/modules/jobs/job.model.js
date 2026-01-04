"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Job = void 0;
const mongoose_1 = require("mongoose");
const JobSchema = new mongoose_1.Schema({
    // Basic Information
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    companyName: { type: String, required: true, trim: true },
    companyLogoUrl: { type: String },
    companyWebsite: { type: String },
    // Company Reference (for company-posted jobs)
    company: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
    },
    // Posted By (User who posted this job)
    postedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    // Job Details
    jobType: {
        type: String,
        enum: ["Full Time", "Part Time", "Contract", "Temporary", "Internship", "Freelance"],
        required: true,
    },
    experience: { type: String, required: true }, // e.g., "2-5 years", "Entry Level"
    salaryCurrency: { type: String, default: "BDT" },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    salaryShowInListing: { type: Boolean, default: false },
    salaryRange: { type: String }, // e.g., "1,00,000 - 2,50,000 BDT"
    // Job Structure
    category: { type: String, required: true },
    categoryRef: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category',
    },
    subcategory: { type: String },
    subcategoryRef: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Category',
    },
    specialization: { type: String },
    // Location
    location: { type: String, required: true },
    locationType: {
        type: String,
        enum: ["On-Site", "Remote", "Hybrid"],
        required: true,
    },
    countries: [{ type: String }],
    // Job Requirements
    vacancies: { type: Number, required: true, min: 1 },
    qualifications: [{ type: String }],
    requiredSkills: [{ type: String }],
    preferredSkills: [{ type: String }],
    // Responsibilities
    responsibilities: [{ type: String }],
    // Benefits
    benefits: [{ type: String }],
    // Time Information
    datePosted: { type: Date, default: Date.now },
    applicationDeadline: { type: Date },
    duration: { type: String }, // For internships/contracts
    // Additional Details
    aboutCompany: { type: String },
    certificationsRequired: [{ type: String }],
    languages: [{
            name: { type: String },
            level: { type: String } // Beginner, Intermediate, Fluent, Native
        }],
    // Status
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    // SEO & Metadata
    tags: [{ type: String }],
}, {
    timestamps: true,
});
// Index for better query performance
JobSchema.index({ slug: 1 });
JobSchema.index({ category: 1 });
JobSchema.index({ categoryRef: 1 });
JobSchema.index({ subcategoryRef: 1 });
JobSchema.index({ location: 1 });
JobSchema.index({ jobType: 1 });
JobSchema.index({ datePosted: -1 });
JobSchema.index({ isActive: 1 });
exports.Job = (0, mongoose_1.model)("Job", JobSchema);
//# sourceMappingURL=job.model.js.map