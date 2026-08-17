/* eslint-disable no-unused-vars */
import { Model, Types } from 'mongoose';
import { USER_ROLE, USER_STATUS } from './user.constant';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * USER INTERFACE - Professional Job Portal Profile
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * Complete user profile for CV Builder and Job Portal functionality.
 * All fields except core ones are optional for flexible profile building.
 */

// ─────────────────────────────────────────────────────────────────────────────
// SUB-INTERFACES FOR COMPLEX FIELDS
// ─────────────────────────────────────────────────────────────────────────────

/** Education/Academic qualification entry */
export interface IEducation {
  degreeType: string;           // e.g., "Bachelor's", "Master's", "PhD", "Diploma"
  degreeName: string;           // e.g., "Computer Science", "Mechanical Engineering"
  institutionName: string;      // University/College name
  location?: string;            // City, Country
  startYear: number;
  endYear?: number;             // Optional if currently studying
  isCurrentlyStudying?: boolean;
  grade?: string;               // e.g., "3.8 GPA", "First Class", "A+"
  description?: string;         // Additional notes
}

/** Work experience entry */
export interface IWorkExperience {
  jobTitle: string;
  companyName: string;
  companyLocation?: string;
  employmentType?: 'Full Time' | 'Part Time' | 'Contract' | 'Internship' | 'Freelance';
  startDate: string;            // YYYY-MM format
  endDate?: string;             // YYYY-MM format or empty if current
  isCurrentJob?: boolean;
  responsibilities?: string[];  // Key responsibilities
  achievements?: string[];      // Key achievements
  description?: string;
}

/** Certificate/Certification entry */
export interface ICertification {
  name: string;                 // Certificate name
  issuingOrganization: string;  // Organization that issued it
  issueDate?: string;           // YYYY-MM format
  expiryDate?: string;          // YYYY-MM format (if applicable)
  credentialId?: string;        // Certificate/Credential ID
  credentialUrl?: string;       // Verification URL
  description?: string;
}

/** Skill entry */
export interface ISkill {
  name: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  yearsOfExperience?: number;
  category?: string;            // e.g., "Programming", "Design", "Management"
}

/** Language proficiency */
export interface ILanguage {
  name: string;
  proficiency: 'Basic' | 'Conversational' | 'Proficient' | 'Fluent' | 'Native';
}

/** Project entry for portfolio */
export interface IProject {
  title: string;
  description?: string;
  role?: string;
  technologies?: string[];
  projectUrl?: string;
  startDate?: string;
  endDate?: string;
  highlights?: string[];
}

/** Award/Achievement entry */
export interface IAward {
  title: string;
  issuer: string;
  date?: string;
  description?: string;
}

/** Reference contact */
export interface IReference {
  name: string;
  position: string;
  company: string;
  email?: string;
  phone?: string;
  relationship?: string;        // e.g., "Former Manager", "Colleague"
}

/** Social/Professional links */
export interface ISocialLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  twitter?: string;
  website?: string;
  other?: { name: string; url: string }[];
}

/** Job alert preferences */
export interface IJobAlertPreferences {
  enabled: boolean;
  categories?: string[];        // Preferred job categories
  locations?: string[];         // Preferred locations
  jobTypes?: ('Full Time' | 'Part Time' | 'Contract' | 'Internship' | 'Remote')[];
  minSalary?: number;
  keywords?: string[];
  frequency: 'instant' | 'daily' | 'weekly';
  lastSentAt?: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN USER TYPE
// ─────────────────────────────────────────────────────────────────────────────

export type TUser = {
  isPasswordMatch(password: string): unknown;
  _id?: string;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CORE FIELDS (Required)
  // ═══════════════════════════════════════════════════════════════════════════
  name: string;
  email: string;
  password: string;
  role: keyof typeof USER_ROLE;
  status: keyof typeof USER_STATUS;
  mobileNumber?: string;
  companyId?: Types.ObjectId;  // For COMPANY role users

  /**
   * CADD CORE Student ID claimed by the user at registration.
   *
   * This is a SELF-REPORTED claim, not a verified one - it is unique across all
   * users so a single ID cannot be reused, but nothing here proves the ID is
   * genuine. The admin-verified counterpart lives in
   * `caddcoreVerification.studentId`, which is only ever written by the
   * verification approval flow.
   *
   * Whether it is required at registration is controlled at runtime by the
   * `registration.student_id_required` setting.
   */
  studentId?: string;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // AUTHENTICATION & SECURITY
  // ═══════════════════════════════════════════════════════════════════════════
  passwordChangedAt?: Date;
  emailVerified?: boolean;
  emailVerificationToken?: string;
  emailVerificationTokenExpires?: Date;
  passwordResetToken?: string;
  passwordResetTokenExpires?: Date;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PERSONAL INFORMATION (CV Section)
  // ═══════════════════════════════════════════════════════════════════════════
  profilePhoto?: string;
  dateOfBirth?: Date;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  nationality?: string;
  nid?: string;                 // National ID
  passportNumber?: string;
  maritalStatus?: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CONTACT & ADDRESS
  // ═══════════════════════════════════════════════════════════════════════════
  alternatePhone?: string;
  alternateEmail?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PROFESSIONAL SUMMARY (CV Section)
  // ═══════════════════════════════════════════════════════════════════════════
  headline?: string;            // Professional headline/tagline
  summary?: string;             // Professional summary/objective
  currentJobTitle?: string;
  currentCompany?: string;
  totalExperienceYears?: number;
  expectedSalary?: number;
  expectedSalaryCurrency?: string;
  noticePeriod?: string;        // e.g., "Immediate", "15 days", "1 month"
  willingToRelocate?: boolean;
  preferredLocations?: string[];
  
  // ═══════════════════════════════════════════════════════════════════════════
  // EDUCATION (CV Section) - Multiple entries
  // ═══════════════════════════════════════════════════════════════════════════
  education?: IEducation[];
  
  // Legacy fields (for backward compatibility)
  degreeType?: string;
  universityName?: string;
  degreeTitle?: string;
  age?: number;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // WORK EXPERIENCE (CV Section) - Multiple entries
  // ═══════════════════════════════════════════════════════════════════════════
  workExperience?: IWorkExperience[];
  
  // Legacy field
  jobExperiences?: {
    organizationName: string;
    startDate: string;
    position: string;
    endDate?: string;
  }[];
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SKILLS (CV Section)
  // ═══════════════════════════════════════════════════════════════════════════
  skills?: ISkill[];
  technicalSkills?: string[];   // Quick list of technical skills
  softSkills?: string[];        // Quick list of soft skills
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CERTIFICATIONS (CV Section) - Multiple entries
  // ═══════════════════════════════════════════════════════════════════════════
  certifications?: ICertification[];
  
  // ═══════════════════════════════════════════════════════════════════════════
  // LANGUAGES (CV Section)
  // ═══════════════════════════════════════════════════════════════════════════
  languages?: ILanguage[];
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PROJECTS & PORTFOLIO (CV Section)
  // ═══════════════════════════════════════════════════════════════════════════
  projects?: IProject[];
  
  // ═══════════════════════════════════════════════════════════════════════════
  // AWARDS & ACHIEVEMENTS (CV Section)
  // ═══════════════════════════════════════════════════════════════════════════
  awards?: IAward[];
  
  // ═══════════════════════════════════════════════════════════════════════════
  // REFERENCES (CV Section)
  // ═══════════════════════════════════════════════════════════════════════════
  references?: IReference[];
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SOCIAL & PROFESSIONAL LINKS
  // ═══════════════════════════════════════════════════════════════════════════
  socialLinks?: ISocialLinks;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // DOCUMENTS (Uploaded files)
  // ═══════════════════════════════════════════════════════════════════════════
  cvUrl?: string;
  experienceCertificateUrl?: string;
  universityCertificateUrl?: string;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PROFESSIONAL AFFILIATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  iebNo?: string;
  affiliationTitle?: string;
  affiliationInstitution?: string;
  affiliationStartDate?: Date;
  affiliationValidTill?: Date;
  affiliationDocument?: string;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // MEMBERSHIP
  // ═══════════════════════════════════════════════════════════════════════════
  membershipId?: string;

  // ═══════════════════════════════════════════════════════════════════════════
  // PLACEMENT CELL
  // ═══════════════════════════════════════════════════════════════════════════
  /**
   * Fields the placement cell owns. They exist because the institute's tracking
   * sheet has columns the portal had nowhere to put - the CADD CORE department
   * a student belongs to, and the counsellor's running notes about them.
   *
   * Admin-only, both ways: the user profile forms never write these, and
   * `placementNotes` is internal, so it must not be sent to the student or to
   * an employer.
   */
  department?: string;
  placementNotes?: string;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // JOB PORTAL FEATURES
  // ═══════════════════════════════════════════════════════════════════════════
  savedJobs?: Types.ObjectId[];              // Array of saved job IDs
  jobAlertPreferences?: IJobAlertPreferences;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CV SETTINGS
  // ═══════════════════════════════════════════════════════════════════════════
  cvTemplate?: string;          // Preferred CV template name
  cvVisibility?: 'public' | 'private' | 'recruiters-only';
  profileCompleteness?: number; // Calculated percentage
  lastProfileUpdate?: Date;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // JOB SEEKING STATUS
  // ═══════════════════════════════════════════════════════════════════════════
  isOpenToWork?: boolean;
  jobSeekingStatus?: 'actively_looking' | 'open_to_opportunities' | 'not_looking' | 'hired';
  openToWorkUpdatedAt?: Date;
  availableFrom?: Date;
  preferredJobTypes?: ('Full Time' | 'Part Time' | 'Contract' | 'Internship' | 'Remote')[];
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CADDCORE CREDENTIALS (the candidate's CLAIM)
  // ═══════════════════════════════════════════════════════════════════════════
  /**
   * What the candidate says about their CADD CORE training, entered in the CV
   * builder alongside the rest of their CV.
   *
   * This is a claim, not a fact. It is copied onto the resume when one is built
   * and becomes true only when a reviewer approves that CV - at which point the
   * badge lands in `caddcoreVerification` below. Keeping the two apart is what
   * lets the claim be edited freely without touching a granted badge.
   */
  caddcoreCredentials?: {
    isCaddcoreStudent?: boolean;
    studentId?: string;
    batchNo?: string;
    enrollmentYear?: number;
    courses?: Array<{
      courseId: string;
      courseName: string;
      completionDate?: Date | string;
      certificateUrl?: string;
    }>;
    hasOnJobTraining?: boolean;
    onJobTrainingDetails?: Record<string, unknown>;
    hasInternship?: boolean;
    internshipDetails?: Record<string, unknown>;
    proofDocuments?: string[];
    candidateNotes?: string;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // CADDCORE VERIFICATION (the ADMIN-GRANTED result)
  // ═══════════════════════════════════════════════════════════════════════════
  caddcoreVerification?: {
    isVerified: boolean;
    verificationStatus: 'not_applied' | 'pending' | 'approved' | 'rejected';
    badgeType?: 'bronze' | 'silver' | 'gold' | 'platinum';
    verifiedAt?: Date;
    verifiedBy?: Types.ObjectId;
    studentId?: string;
    batchNo?: string;
    courses?: {
      courseId: string;
      courseName: string;
      completedAt?: Date;
    }[];
    hasOnJobTraining?: boolean;
    hasInternship?: boolean;
    priorityScore?: number;
  };
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TIMESTAMPS
  // ═══════════════════════════════════════════════════════════════════════════
  createdAt?: Date;
  updatedAt?: Date;
};

// ─────────────────────────────────────────────────────────────────────────────
// USER MODEL INTERFACE
// ─────────────────────────────────────────────────────────────────────────────

export interface IUserModel extends Model<TUser> {
  isUserExistsByEmail(id: string): Promise<TUser>;
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string
  ): Promise<boolean>;
  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number
  ): boolean;
  calculateProfileCompleteness(user: TUser): number;
}