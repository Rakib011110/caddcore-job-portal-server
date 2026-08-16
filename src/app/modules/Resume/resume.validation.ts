import { z } from 'zod';
import { RESUME_TEMPLATE_IDS } from './resume.templates';
import { RESUME_SECTION_KEYS } from './resume.document';

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

const educationSchema = z.object({
  degreeType: z.string().optional(),
  degreeName: z.string().optional(),
  institutionName: z.string().optional(),
  location: z.string().optional(),
  startYear: z.number().optional(),
  endYear: z.number().optional(),
  isCurrentlyStudying: z.boolean().optional(),
  grade: z.string().optional(),
  description: z.string().optional(),
});

const workExperienceSchema = z.object({
  jobTitle: z.string().optional(),
  companyName: z.string().optional(),
  companyLocation: z.string().optional(),
  employmentType: z
    .enum(['Full Time', 'Part Time', 'Contract', 'Internship', 'Freelance'])
    .optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isCurrentJob: z.boolean().optional(),
  responsibilities: z.array(z.string()).optional(),
  achievements: z.array(z.string()).optional(),
  description: z.string().optional(),
});

const skillSchema = z.object({
  name: z.string().optional(),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']).optional(),
  yearsOfExperience: z.number().optional(),
  category: z.string().optional(),
});

const certificationSchema = z.object({
  name: z.string().optional(),
  issuingOrganization: z.string().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.string().optional(),
  description: z.string().optional(),
});

const languageSchema = z.object({
  name: z.string().optional(),
  proficiency: z
    .enum(['Basic', 'Conversational', 'Proficient', 'Fluent', 'Native'])
    .optional(),
});

const projectSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  role: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  projectUrl: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  highlights: z.array(z.string()).optional(),
});

const awardSchema = z.object({
  title: z.string().optional(),
  issuer: z.string().optional(),
  date: z.string().optional(),
  description: z.string().optional(),
});

const referenceSchema = z.object({
  name: z.string().optional(),
  position: z.string().optional(),
  company: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  relationship: z.string().optional(),
});

const socialLinksSchema = z.object({
  linkedin: z.string().optional(),
  github: z.string().optional(),
  portfolio: z.string().optional(),
  twitter: z.string().optional(),
  website: z.string().optional(),
  other: z.array(z.object({ name: z.string(), url: z.string() })).optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT
// ─────────────────────────────────────────────────────────────────────────────

const resumeContentSchema = {
  fullName: z.string().max(150).optional(),
  email: z.string().max(200).optional(),
  phone: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  profilePhoto: z.string().optional(),

  headline: z.string().max(200).optional(),
  summary: z.string().max(3000).optional(),
  currentJobTitle: z.string().max(150).optional(),
  totalExperienceYears: z.number().min(0).max(80).optional(),
  expectedSalary: z.number().min(0).optional(),

  education: z.array(educationSchema).optional(),
  workExperience: z.array(workExperienceSchema).optional(),
  skills: z.array(skillSchema).optional(),
  certifications: z.array(certificationSchema).optional(),
  languages: z.array(languageSchema).optional(),
  projects: z.array(projectSchema).optional(),
  awards: z.array(awardSchema).optional(),
  references: z.array(referenceSchema).optional(),
  socialLinks: socialLinksSchema.optional(),

  fileUrl: z.string().optional(),
  // Only the formats in the shared registry. A free-form string here would let
  // a resume be approved in a layout nothing can actually render.
  template: z
    .enum(RESUME_TEMPLATE_IDS as [string, ...string[]])
    .optional(),
  // Only known section keys; the renderer drops anything it does not know, but
  // rejecting it here keeps junk out of the document in the first place.
  sectionOrder: z
    .array(z.enum(RESUME_SECTION_KEYS as [string, ...string[]]))
    .optional(),
};

// ─────────────────────────────────────────────────────────────────────────────
// REQUEST SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

const createResumeValidationSchema = z.object({
  body: z.object({
    title: z.string().max(120).optional(),
    isDefault: z.boolean().optional(),
    fromProfile: z.boolean().optional(),
    ...resumeContentSchema,
  }),
});

const updateResumeValidationSchema = z.object({
  body: z.object({
    title: z.string().max(120).optional(),
    isDefault: z.boolean().optional(),
    ...resumeContentSchema,
  }),
});

const submitResumeValidationSchema = z.object({
  body: z
    .object({
      submissionNote: z.string().max(1000).optional(),
    })
    .optional(),
});

const approveResumeValidationSchema = z.object({
  body: z
    .object({
      reviewerNotes: z.string().max(2000).optional(),
    })
    .optional(),
});

const rejectResumeValidationSchema = z.object({
  body: z
    .object({
      // Optional per spec: reviewers may reject without writing feedback
      rejectionReason: z.string().max(2000).optional(),
      reviewerNotes: z.string().max(2000).optional(),
    })
    .optional(),
});

export const ResumeValidations = {
  createResumeValidationSchema,
  updateResumeValidationSchema,
  submitResumeValidationSchema,
  approveResumeValidationSchema,
  rejectResumeValidationSchema,
};
