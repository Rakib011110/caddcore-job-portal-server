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
/** Education/Academic qualification entry */
export interface IEducation {
    degreeType: string;
    degreeName: string;
    institutionName: string;
    location?: string;
    startYear: number;
    endYear?: number;
    isCurrentlyStudying?: boolean;
    grade?: string;
    description?: string;
}
/** Work experience entry */
export interface IWorkExperience {
    jobTitle: string;
    companyName: string;
    companyLocation?: string;
    employmentType?: 'Full Time' | 'Part Time' | 'Contract' | 'Internship' | 'Freelance';
    startDate: string;
    endDate?: string;
    isCurrentJob?: boolean;
    responsibilities?: string[];
    achievements?: string[];
    description?: string;
}
/** Certificate/Certification entry */
export interface ICertification {
    name: string;
    issuingOrganization: string;
    issueDate?: string;
    expiryDate?: string;
    credentialId?: string;
    credentialUrl?: string;
    description?: string;
}
/** Skill entry */
export interface ISkill {
    name: string;
    level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    yearsOfExperience?: number;
    category?: string;
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
    relationship?: string;
}
/** Social/Professional links */
export interface ISocialLinks {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    twitter?: string;
    website?: string;
    other?: {
        name: string;
        url: string;
    }[];
}
/** Job alert preferences */
export interface IJobAlertPreferences {
    enabled: boolean;
    categories?: string[];
    locations?: string[];
    jobTypes?: ('Full Time' | 'Part Time' | 'Contract' | 'Internship' | 'Remote')[];
    minSalary?: number;
    keywords?: string[];
    frequency: 'instant' | 'daily' | 'weekly';
    lastSentAt?: Date;
}
export type TUser = {
    isPasswordMatch(password: string): unknown;
    _id?: string;
    name: string;
    email: string;
    password: string;
    role: keyof typeof USER_ROLE;
    status: keyof typeof USER_STATUS;
    mobileNumber?: string;
    companyId?: Types.ObjectId;
    passwordChangedAt?: Date;
    emailVerified?: boolean;
    emailVerificationToken?: string;
    emailVerificationTokenExpires?: Date;
    passwordResetToken?: string;
    passwordResetTokenExpires?: Date;
    profilePhoto?: string;
    dateOfBirth?: Date;
    gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
    nationality?: string;
    nid?: string;
    passportNumber?: string;
    maritalStatus?: 'Single' | 'Married' | 'Divorced' | 'Widowed';
    alternatePhone?: string;
    alternateEmail?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    headline?: string;
    summary?: string;
    currentJobTitle?: string;
    currentCompany?: string;
    totalExperienceYears?: number;
    expectedSalary?: number;
    expectedSalaryCurrency?: string;
    noticePeriod?: string;
    willingToRelocate?: boolean;
    preferredLocations?: string[];
    education?: IEducation[];
    degreeType?: string;
    universityName?: string;
    degreeTitle?: string;
    age?: number;
    workExperience?: IWorkExperience[];
    jobExperiences?: {
        organizationName: string;
        startDate: string;
        position: string;
        endDate?: string;
    }[];
    skills?: ISkill[];
    technicalSkills?: string[];
    softSkills?: string[];
    certifications?: ICertification[];
    languages?: ILanguage[];
    projects?: IProject[];
    awards?: IAward[];
    references?: IReference[];
    socialLinks?: ISocialLinks;
    cvUrl?: string;
    experienceCertificateUrl?: string;
    universityCertificateUrl?: string;
    iebNo?: string;
    affiliationTitle?: string;
    affiliationInstitution?: string;
    affiliationStartDate?: Date;
    affiliationValidTill?: Date;
    affiliationDocument?: string;
    membershipId?: string;
    savedJobs?: Types.ObjectId[];
    jobAlertPreferences?: IJobAlertPreferences;
    cvTemplate?: string;
    cvVisibility?: 'public' | 'private' | 'recruiters-only';
    profileCompleteness?: number;
    lastProfileUpdate?: Date;
    isOpenToWork?: boolean;
    jobSeekingStatus?: 'actively_looking' | 'open_to_opportunities' | 'not_looking' | 'hired';
    openToWorkUpdatedAt?: Date;
    availableFrom?: Date;
    preferredJobTypes?: ('Full Time' | 'Part Time' | 'Contract' | 'Internship' | 'Remote')[];
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
    createdAt?: Date;
    updatedAt?: Date;
};
export interface IUserModel extends Model<TUser> {
    isUserExistsByEmail(id: string): Promise<TUser>;
    isPasswordMatched(plainTextPassword: string, hashedPassword: string): Promise<boolean>;
    isJWTIssuedBeforePasswordChanged(passwordChangedTimestamp: Date, jwtIssuedTimestamp: number): boolean;
    calculateProfileCompleteness(user: TUser): number;
}
//# sourceMappingURL=user.interface.d.ts.map