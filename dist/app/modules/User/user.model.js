"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
/* eslint-disable no-useless-escape */
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = require("mongoose");
const user_constant_1 = require("./user.constant");
const config_1 = __importDefault(require("../../../config"));
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * USER SCHEMA - Professional Job Portal Profile
 * ═══════════════════════════════════════════════════════════════════════════════
 */
// ─────────────────────────────────────────────────────────────────────────────
// SUB-SCHEMAS FOR COMPLEX FIELDS
// ─────────────────────────────────────────────────────────────────────────────
const educationSchema = new mongoose_1.Schema({
    degreeType: { type: String, required: true },
    degreeName: { type: String, required: true },
    institutionName: { type: String, required: true },
    location: { type: String },
    startYear: { type: Number, required: true },
    endYear: { type: Number },
    isCurrentlyStudying: { type: Boolean, default: false },
    grade: { type: String },
    description: { type: String }
}, { _id: true });
const workExperienceSchema = new mongoose_1.Schema({
    jobTitle: { type: String, required: true },
    companyName: { type: String, required: true },
    companyLocation: { type: String },
    employmentType: {
        type: String,
        enum: ['Full Time', 'Part Time', 'Contract', 'Internship', 'Freelance']
    },
    startDate: { type: String, required: true },
    endDate: { type: String },
    isCurrentJob: { type: Boolean, default: false },
    responsibilities: [{ type: String }],
    achievements: [{ type: String }],
    description: { type: String }
}, { _id: true });
const certificationSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    issuingOrganization: { type: String, required: true },
    issueDate: { type: String },
    expiryDate: { type: String },
    credentialId: { type: String },
    credentialUrl: { type: String },
    description: { type: String }
}, { _id: true });
const skillSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'] },
    yearsOfExperience: { type: Number },
    category: { type: String }
}, { _id: true });
const languageSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    proficiency: {
        type: String,
        enum: ['Basic', 'Conversational', 'Proficient', 'Fluent', 'Native'],
        required: true
    }
}, { _id: true });
const projectSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String },
    role: { type: String },
    technologies: [{ type: String }],
    projectUrl: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    highlights: [{ type: String }]
}, { _id: true });
const awardSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    issuer: { type: String, required: true },
    date: { type: String },
    description: { type: String }
}, { _id: true });
const referenceSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    position: { type: String, required: true },
    company: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    relationship: { type: String }
}, { _id: true });
const socialLinksSchema = new mongoose_1.Schema({
    linkedin: { type: String },
    github: { type: String },
    portfolio: { type: String },
    twitter: { type: String },
    website: { type: String },
    other: [{ name: String, url: String }]
}, { _id: false });
const jobAlertPreferencesSchema = new mongoose_1.Schema({
    enabled: { type: Boolean, default: false },
    categories: [{ type: String }],
    locations: [{ type: String }],
    jobTypes: [{ type: String, enum: ['Full Time', 'Part Time', 'Contract', 'Internship', 'Remote'] }],
    minSalary: { type: Number },
    keywords: [{ type: String }],
    frequency: { type: String, enum: ['instant', 'daily', 'weekly'], default: 'daily' },
    lastSentAt: { type: Date }
}, { _id: false });
// ─────────────────────────────────────────────────────────────────────────────
// MAIN USER SCHEMA
// ─────────────────────────────────────────────────────────────────────────────
const userSchema = new mongoose_1.Schema({
    // ═══════════════════════════════════════════════════════════════════════
    // CORE FIELDS
    // ═══════════════════════════════════════════════════════════════════════
    name: { type: String, required: true },
    role: { type: String, enum: Object.keys(user_constant_1.USER_ROLE), required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, 'Please fill a valid email address'],
    },
    password: { type: String, required: true, select: 0 },
    status: { type: String, enum: Object.keys(user_constant_1.USER_STATUS), default: user_constant_1.USER_STATUS.ACTIVE },
    mobileNumber: { type: String },
    // Company reference (for COMPANY role users)
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
    },
    // ═══════════════════════════════════════════════════════════════════════
    // AUTHENTICATION & SECURITY
    // ═══════════════════════════════════════════════════════════════════════
    passwordChangedAt: { type: Date },
    emailVerified: { type: Boolean, default: true },
    emailVerificationToken: { type: String, select: true },
    emailVerificationTokenExpires: { type: Date, select: true },
    passwordResetToken: { type: String, select: false },
    passwordResetTokenExpires: { type: Date, select: false },
    // ═══════════════════════════════════════════════════════════════════════
    // PERSONAL INFORMATION
    // ═══════════════════════════════════════════════════════════════════════
    profilePhoto: { type: String, default: null },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other', 'Prefer not to say'] },
    nationality: { type: String },
    nid: { type: String },
    passportNumber: { type: String },
    maritalStatus: { type: String, enum: ['Single', 'Married', 'Divorced', 'Widowed'] },
    // ═══════════════════════════════════════════════════════════════════════
    // CONTACT & ADDRESS
    // ═══════════════════════════════════════════════════════════════════════
    alternatePhone: { type: String },
    alternateEmail: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    postalCode: { type: String },
    // ═══════════════════════════════════════════════════════════════════════
    // PROFESSIONAL SUMMARY
    // ═══════════════════════════════════════════════════════════════════════
    headline: { type: String, maxlength: 200 },
    summary: { type: String, maxlength: 2000 },
    currentJobTitle: { type: String },
    currentCompany: { type: String },
    totalExperienceYears: { type: Number, min: 0, max: 60 },
    expectedSalary: { type: Number },
    expectedSalaryCurrency: { type: String, default: 'BDT' },
    noticePeriod: { type: String },
    willingToRelocate: { type: Boolean, default: false },
    preferredLocations: [{ type: String }],
    // ═══════════════════════════════════════════════════════════════════════
    // EDUCATION
    // ═══════════════════════════════════════════════════════════════════════
    education: [educationSchema],
    // Legacy fields (backward compatibility)
    degreeType: { type: String },
    universityName: { type: String },
    degreeTitle: { type: String },
    age: { type: Number },
    // ═══════════════════════════════════════════════════════════════════════
    // WORK EXPERIENCE
    // ═══════════════════════════════════════════════════════════════════════
    workExperience: [workExperienceSchema],
    // Legacy field
    jobExperiences: [{
            organizationName: { type: String, required: true },
            startDate: { type: String, required: true },
            position: { type: String, required: true },
            endDate: { type: String }
        }],
    // ═══════════════════════════════════════════════════════════════════════
    // SKILLS
    // ═══════════════════════════════════════════════════════════════════════
    skills: [skillSchema],
    technicalSkills: [{ type: String }],
    softSkills: [{ type: String }],
    // ═══════════════════════════════════════════════════════════════════════
    // CERTIFICATIONS
    // ═══════════════════════════════════════════════════════════════════════
    certifications: [certificationSchema],
    // ═══════════════════════════════════════════════════════════════════════
    // LANGUAGES
    // ═══════════════════════════════════════════════════════════════════════
    languages: [languageSchema],
    // ═══════════════════════════════════════════════════════════════════════
    // PROJECTS & PORTFOLIO
    // ═══════════════════════════════════════════════════════════════════════
    projects: [projectSchema],
    // ═══════════════════════════════════════════════════════════════════════
    // AWARDS & ACHIEVEMENTS
    // ═══════════════════════════════════════════════════════════════════════
    awards: [awardSchema],
    // ═══════════════════════════════════════════════════════════════════════
    // REFERENCES
    // ═══════════════════════════════════════════════════════════════════════
    references: [referenceSchema],
    // ═══════════════════════════════════════════════════════════════════════
    // SOCIAL & PROFESSIONAL LINKS
    // ═══════════════════════════════════════════════════════════════════════
    socialLinks: socialLinksSchema,
    // ═══════════════════════════════════════════════════════════════════════
    // DOCUMENTS
    // ═══════════════════════════════════════════════════════════════════════
    cvUrl: { type: String },
    experienceCertificateUrl: { type: String },
    universityCertificateUrl: { type: String },
    // ═══════════════════════════════════════════════════════════════════════
    // PROFESSIONAL AFFILIATIONS
    // ═══════════════════════════════════════════════════════════════════════
    iebNo: { type: String },
    affiliationTitle: { type: String },
    affiliationInstitution: { type: String },
    affiliationStartDate: { type: Date },
    affiliationValidTill: { type: Date },
    affiliationDocument: { type: String },
    // ═══════════════════════════════════════════════════════════════════════
    // MEMBERSHIP
    // ═══════════════════════════════════════════════════════════════════════
    membershipId: { type: String, unique: true, sparse: true },
    // ═══════════════════════════════════════════════════════════════════════
    // JOB PORTAL FEATURES
    // ═══════════════════════════════════════════════════════════════════════
    savedJobs: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Job' }],
    jobAlertPreferences: jobAlertPreferencesSchema,
    // ═══════════════════════════════════════════════════════════════════════
    // CV SETTINGS
    // ═══════════════════════════════════════════════════════════════════════
    cvTemplate: { type: String, default: 'modern' },
    cvVisibility: { type: String, enum: ['public', 'private', 'recruiters-only'], default: 'private' },
    profileCompleteness: { type: Number, default: 0, min: 0, max: 100 },
    lastProfileUpdate: { type: Date },
    // ═══════════════════════════════════════════════════════════════════════
    // JOB SEEKING STATUS
    // ═══════════════════════════════════════════════════════════════════════
    isOpenToWork: { type: Boolean, default: false },
    jobSeekingStatus: {
        type: String,
        enum: ['actively_looking', 'open_to_opportunities', 'not_looking', 'hired'],
        default: 'not_looking'
    },
    openToWorkUpdatedAt: { type: Date },
    availableFrom: { type: Date },
    preferredJobTypes: [{
            type: String,
            enum: ['Full Time', 'Part Time', 'Contract', 'Internship', 'Remote']
        }],
    // ═══════════════════════════════════════════════════════════════════════
    // CADDCORE VERIFICATION
    // ═══════════════════════════════════════════════════════════════════════
    caddcoreVerification: {
        isVerified: { type: Boolean, default: false },
        verificationStatus: {
            type: String,
            enum: ['not_applied', 'pending', 'approved', 'rejected'],
            default: 'not_applied'
        },
        badgeType: {
            type: String,
            enum: ['bronze', 'silver', 'gold', 'platinum']
        },
        verifiedAt: { type: Date },
        verifiedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
        studentId: { type: String },
        batchNo: { type: String },
        courses: [{
                courseId: { type: String, required: true },
                courseName: { type: String, required: true },
                completedAt: { type: Date }
            }],
        hasOnJobTraining: { type: Boolean, default: false },
        hasInternship: { type: Boolean, default: false },
        priorityScore: { type: Number, default: 0 }
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.password;
            return ret;
        }
    }
});
// ─────────────────────────────────────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ 'skills.name': 1 });
userSchema.index({ 'education.institutionName': 1 });
userSchema.index({ currentJobTitle: 'text', headline: 'text', summary: 'text' });
// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
    // Normalize email to lowercase
    if (this.isModified('email')) {
        this.email = this.email.toLowerCase();
    }
    // Only hash when password was created or changed
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcryptjs_1.default.hash(this.password, Number(config_1.default.bcrypt_salt_rounds));
    // Update last profile update time
    this.lastProfileUpdate = new Date();
    next();
});
userSchema.post('save', function (doc, next) {
    doc.password = '';
    next();
});
userSchema.set('toJSON', {
    transform: function (doc, ret) {
        delete ret.password;
        return ret;
    }
});
// ─────────────────────────────────────────────────────────────────────────────
// STATIC METHODS
// ─────────────────────────────────────────────────────────────────────────────
userSchema.statics.isUserExistsByEmail = async function (email) {
    return await exports.User.findOne({ email: new RegExp(`^${email}$`, 'i') }).select('+password');
};
userSchema.statics.isPasswordMatched = async function (plainTextPassword, hashedPassword) {
    return await bcryptjs_1.default.compare(plainTextPassword, hashedPassword);
};
userSchema.statics.isJWTIssuedBeforePasswordChanged = function (passwordChangedTimestamp, jwtIssuedTimestamp) {
    const passwordChangedTime = new Date(passwordChangedTimestamp).getTime() / 1000;
    return passwordChangedTime > jwtIssuedTimestamp;
};
/**
 * Calculate profile completeness percentage
 */
userSchema.statics.calculateProfileCompleteness = function (user) {
    let totalFields = 0;
    let completedFields = 0;
    // Core fields (weight: 2)
    const coreFields = ['name', 'email', 'mobileNumber', 'profilePhoto'];
    coreFields.forEach(field => {
        totalFields += 2;
        if (user[field])
            completedFields += 2;
    });
    // Personal info (weight: 1)
    const personalFields = ['dateOfBirth', 'gender', 'nationality', 'address', 'city', 'country'];
    personalFields.forEach(field => {
        totalFields += 1;
        if (user[field])
            completedFields += 1;
    });
    // Professional summary (weight: 2)
    const professionalFields = ['headline', 'summary', 'currentJobTitle', 'totalExperienceYears'];
    professionalFields.forEach(field => {
        totalFields += 2;
        if (user[field])
            completedFields += 2;
    });
    // Arrays (weight: 3 each if at least one entry)
    const arrayFields = ['education', 'workExperience', 'skills', 'certifications', 'languages'];
    arrayFields.forEach(field => {
        totalFields += 3;
        if (user[field]?.length > 0)
            completedFields += 3;
    });
    // Social links (weight: 1)
    totalFields += 1;
    if (user.socialLinks?.linkedin || user.socialLinks?.github || user.socialLinks?.portfolio) {
        completedFields += 1;
    }
    return Math.round((completedFields / totalFields) * 100);
};
exports.User = (0, mongoose_1.model)('User', userSchema);
//# sourceMappingURL=user.model.js.map