"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeValidations = void 0;
const zod_1 = require("zod");
const resume_templates_1 = require("./resume.templates");
const resume_document_1 = require("./resume.document");
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * RESUME VALIDATION
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Content validation is deliberately permissive: a DRAFT must be saveable half
 * finished. Completeness ("do you actually have a name and some history?") is
 * enforced at submit time in the service layer.
 */
// ─────────────────────────────────────────────────────────────────────────────
// CV SECTION SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────
const educationSchema = zod_1.z.object({
    degreeType: zod_1.z.string().optional(),
    degreeName: zod_1.z.string().optional(),
    institutionName: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    startYear: zod_1.z.number().optional(),
    endYear: zod_1.z.number().optional(),
    isCurrentlyStudying: zod_1.z.boolean().optional(),
    grade: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
});
const workExperienceSchema = zod_1.z.object({
    jobTitle: zod_1.z.string().optional(),
    companyName: zod_1.z.string().optional(),
    companyLocation: zod_1.z.string().optional(),
    employmentType: zod_1.z
        .enum(['Full Time', 'Part Time', 'Contract', 'Internship', 'Freelance'])
        .optional(),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    isCurrentJob: zod_1.z.boolean().optional(),
    responsibilities: zod_1.z.array(zod_1.z.string()).optional(),
    achievements: zod_1.z.array(zod_1.z.string()).optional(),
    description: zod_1.z.string().optional(),
});
const skillSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    level: zod_1.z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']).optional(),
    yearsOfExperience: zod_1.z.number().optional(),
    category: zod_1.z.string().optional(),
});
const certificationSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    issuingOrganization: zod_1.z.string().optional(),
    issueDate: zod_1.z.string().optional(),
    expiryDate: zod_1.z.string().optional(),
    credentialId: zod_1.z.string().optional(),
    credentialUrl: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
});
const languageSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    proficiency: zod_1.z
        .enum(['Basic', 'Conversational', 'Proficient', 'Fluent', 'Native'])
        .optional(),
});
const projectSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    role: zod_1.z.string().optional(),
    technologies: zod_1.z.array(zod_1.z.string()).optional(),
    projectUrl: zod_1.z.string().optional(),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    highlights: zod_1.z.array(zod_1.z.string()).optional(),
});
const awardSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    issuer: zod_1.z.string().optional(),
    date: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
});
const referenceSchema = zod_1.z.object({
    name: zod_1.z.string().optional(),
    position: zod_1.z.string().optional(),
    company: zod_1.z.string().optional(),
    email: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
    relationship: zod_1.z.string().optional(),
});
const socialLinksSchema = zod_1.z.object({
    linkedin: zod_1.z.string().optional(),
    github: zod_1.z.string().optional(),
    portfolio: zod_1.z.string().optional(),
    twitter: zod_1.z.string().optional(),
    website: zod_1.z.string().optional(),
    other: zod_1.z.array(zod_1.z.object({ name: zod_1.z.string(), url: zod_1.z.string() })).optional(),
});
// ─────────────────────────────────────────────────────────────────────────────
// CONTENT
// ─────────────────────────────────────────────────────────────────────────────
const resumeContentSchema = {
    fullName: zod_1.z.string().max(150).optional(),
    email: zod_1.z.string().max(200).optional(),
    phone: zod_1.z.string().max(50).optional(),
    address: zod_1.z.string().max(500).optional(),
    city: zod_1.z.string().max(100).optional(),
    country: zod_1.z.string().max(100).optional(),
    profilePhoto: zod_1.z.string().optional(),
    headline: zod_1.z.string().max(200).optional(),
    summary: zod_1.z.string().max(3000).optional(),
    currentJobTitle: zod_1.z.string().max(150).optional(),
    totalExperienceYears: zod_1.z.number().min(0).max(80).optional(),
    expectedSalary: zod_1.z.number().min(0).optional(),
    education: zod_1.z.array(educationSchema).optional(),
    workExperience: zod_1.z.array(workExperienceSchema).optional(),
    skills: zod_1.z.array(skillSchema).optional(),
    certifications: zod_1.z.array(certificationSchema).optional(),
    languages: zod_1.z.array(languageSchema).optional(),
    projects: zod_1.z.array(projectSchema).optional(),
    awards: zod_1.z.array(awardSchema).optional(),
    references: zod_1.z.array(referenceSchema).optional(),
    socialLinks: socialLinksSchema.optional(),
    fileUrl: zod_1.z.string().optional(),
    // Only the formats in the shared registry. A free-form string here would let
    // a resume be approved in a layout nothing can actually render.
    template: zod_1.z
        .enum(resume_templates_1.RESUME_TEMPLATE_IDS)
        .optional(),
    // Only known section keys; the renderer drops anything it does not know, but
    // rejecting it here keeps junk out of the document in the first place.
    sectionOrder: zod_1.z
        .array(zod_1.z.enum(resume_document_1.RESUME_SECTION_KEYS))
        .optional(),
};
// ─────────────────────────────────────────────────────────────────────────────
// REQUEST SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────
const createResumeValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().max(120).optional(),
        isDefault: zod_1.z.boolean().optional(),
        fromProfile: zod_1.z.boolean().optional(),
        ...resumeContentSchema,
    }),
});
const updateResumeValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().max(120).optional(),
        isDefault: zod_1.z.boolean().optional(),
        ...resumeContentSchema,
    }),
});
const submitResumeValidationSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        submissionNote: zod_1.z.string().max(1000).optional(),
    })
        .optional(),
});
const approveResumeValidationSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        reviewerNotes: zod_1.z.string().max(2000).optional(),
    })
        .optional(),
});
const rejectResumeValidationSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        // Optional per spec: reviewers may reject without writing feedback
        rejectionReason: zod_1.z.string().max(2000).optional(),
        reviewerNotes: zod_1.z.string().max(2000).optional(),
    })
        .optional(),
});
exports.ResumeValidations = {
    createResumeValidationSchema,
    updateResumeValidationSchema,
    submitResumeValidationSchema,
    approveResumeValidationSchema,
    rejectResumeValidationSchema,
};
//# sourceMappingURL=resume.validation.js.map