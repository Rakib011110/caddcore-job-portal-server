import { TUser } from "./user.interface";
import mongoose from 'mongoose';
interface CandidateQueryParams {
    page?: number;
    limit?: number;
    searchTerm?: string;
    skills?: string;
    experienceLevel?: string;
    location?: string;
}
export declare const UserServices: {
    createUserIntoDB: (payload: TUser) => Promise<mongoose.Document<unknown, {}, TUser, {}, {}> & TUser & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    getAllUsersFromDb: () => Promise<(mongoose.Document<unknown, {}, TUser, {}, {}> & TUser & Required<{
        _id: string;
    }> & {
        __v: number;
    })[]>;
    getAUserFromDb: (id: string) => Promise<mongoose.Document<unknown, {}, TUser, {}, {}> & TUser & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    updpateUserInDb: (id: string, payload: Partial<TUser>) => Promise<{
        user: {
            profileCompleteness: number;
            isPasswordMatch(password: string): unknown;
            _id: string;
            name: string;
            email: string;
            password: string;
            role: keyof typeof import("./user.constant").USER_ROLE;
            status: keyof typeof import("./user.constant").USER_STATUS;
            mobileNumber?: string;
            companyId?: mongoose.Types.ObjectId;
            passwordChangedAt?: Date;
            emailVerified?: boolean;
            emailVerificationToken?: string;
            emailVerificationTokenExpires?: Date;
            passwordResetToken?: string;
            passwordResetTokenExpires?: Date;
            profilePhoto?: string;
            dateOfBirth?: Date;
            gender?: "Male" | "Female" | "Other" | "Prefer not to say";
            nationality?: string;
            nid?: string;
            passportNumber?: string;
            maritalStatus?: "Single" | "Married" | "Divorced" | "Widowed";
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
            education?: import("./user.interface").IEducation[];
            degreeType?: string;
            universityName?: string;
            degreeTitle?: string;
            age?: number;
            workExperience?: import("./user.interface").IWorkExperience[];
            jobExperiences?: {
                organizationName: string;
                startDate: string;
                position: string;
                endDate?: string;
            }[];
            skills?: import("./user.interface").ISkill[];
            technicalSkills?: string[];
            softSkills?: string[];
            certifications?: import("./user.interface").ICertification[];
            languages?: import("./user.interface").ILanguage[];
            projects?: import("./user.interface").IProject[];
            awards?: import("./user.interface").IAward[];
            references?: import("./user.interface").IReference[];
            socialLinks?: import("./user.interface").ISocialLinks;
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
            savedJobs?: mongoose.Types.ObjectId[];
            jobAlertPreferences?: import("./user.interface").IJobAlertPreferences;
            cvTemplate?: string;
            cvVisibility?: "public" | "private" | "recruiters-only";
            lastProfileUpdate?: Date;
            isOpenToWork?: boolean;
            jobSeekingStatus?: "actively_looking" | "open_to_opportunities" | "not_looking" | "hired";
            openToWorkUpdatedAt?: Date;
            availableFrom?: Date;
            preferredJobTypes?: ("Full Time" | "Part Time" | "Contract" | "Internship" | "Remote")[];
            caddcoreVerification?: {
                isVerified: boolean;
                verificationStatus: "not_applied" | "pending" | "approved" | "rejected";
                badgeType?: "bronze" | "silver" | "gold" | "platinum";
                verifiedAt?: Date;
                verifiedBy?: mongoose.Types.ObjectId;
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
            __v: number;
        };
        accessToken: string;
    }>;
    deleteUserFromDb: (id: string) => Promise<mongoose.Document<unknown, {}, TUser, {}, {}> & TUser & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    uploadProfilePhoto: (userId: string, file: Express.Multer.File) => Promise<mongoose.Document<unknown, {}, TUser, {}, {}> & TUser & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    makeBaseMember: (id: string, membershipData: {
        membershipId?: string;
        prefix?: string;
    }) => Promise<(mongoose.Document<unknown, {}, TUser, {}, {}> & TUser & Required<{
        _id: string;
    }> & {
        __v: number;
    }) | null>;
    getSavedJobs: (userId: string) => Promise<mongoose.Types.ObjectId[]>;
    saveJob: (userId: string, jobId: string) => Promise<mongoose.Types.ObjectId[] | undefined>;
    unsaveJob: (userId: string, jobId: string) => Promise<mongoose.Types.ObjectId[] | undefined>;
    isJobSaved: (userId: string, jobId: string) => Promise<boolean>;
    getJobAlertPreferences: (userId: string) => Promise<import("./user.interface").IJobAlertPreferences>;
    updateJobAlertPreferences: (userId: string, preferences: any) => Promise<import("./user.interface").IJobAlertPreferences | undefined>;
    getUsersWithJobAlerts: (frequency: "instant" | "daily" | "weekly") => Promise<(mongoose.Document<unknown, {}, TUser, {}, {}> & TUser & Required<{
        _id: string;
    }> & {
        __v: number;
    })[]>;
    getCVData: (userId: string) => Promise<mongoose.Document<unknown, {}, TUser, {}, {}> & TUser & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
    updateCVData: (userId: string, cvData: Partial<TUser>) => Promise<{
        profileCompleteness: number;
        isPasswordMatch(password: string): unknown;
        _id: string;
        name: string;
        email: string;
        password: string;
        role: keyof typeof import("./user.constant").USER_ROLE;
        status: keyof typeof import("./user.constant").USER_STATUS;
        mobileNumber?: string;
        companyId?: mongoose.Types.ObjectId;
        passwordChangedAt?: Date;
        emailVerified?: boolean;
        emailVerificationToken?: string;
        emailVerificationTokenExpires?: Date;
        passwordResetToken?: string;
        passwordResetTokenExpires?: Date;
        profilePhoto?: string;
        dateOfBirth?: Date;
        gender?: "Male" | "Female" | "Other" | "Prefer not to say";
        nationality?: string;
        nid?: string;
        passportNumber?: string;
        maritalStatus?: "Single" | "Married" | "Divorced" | "Widowed";
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
        education?: import("./user.interface").IEducation[];
        degreeType?: string;
        universityName?: string;
        degreeTitle?: string;
        age?: number;
        workExperience?: import("./user.interface").IWorkExperience[];
        jobExperiences?: {
            organizationName: string;
            startDate: string;
            position: string;
            endDate?: string;
        }[];
        skills?: import("./user.interface").ISkill[];
        technicalSkills?: string[];
        softSkills?: string[];
        certifications?: import("./user.interface").ICertification[];
        languages?: import("./user.interface").ILanguage[];
        projects?: import("./user.interface").IProject[];
        awards?: import("./user.interface").IAward[];
        references?: import("./user.interface").IReference[];
        socialLinks?: import("./user.interface").ISocialLinks;
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
        savedJobs?: mongoose.Types.ObjectId[];
        jobAlertPreferences?: import("./user.interface").IJobAlertPreferences;
        cvTemplate?: string;
        cvVisibility?: "public" | "private" | "recruiters-only";
        lastProfileUpdate?: Date;
        isOpenToWork?: boolean;
        jobSeekingStatus?: "actively_looking" | "open_to_opportunities" | "not_looking" | "hired";
        openToWorkUpdatedAt?: Date;
        availableFrom?: Date;
        preferredJobTypes?: ("Full Time" | "Part Time" | "Contract" | "Internship" | "Remote")[];
        caddcoreVerification?: {
            isVerified: boolean;
            verificationStatus: "not_applied" | "pending" | "approved" | "rejected";
            badgeType?: "bronze" | "silver" | "gold" | "platinum";
            verifiedAt?: Date;
            verifiedBy?: mongoose.Types.ObjectId;
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
        __v: number;
    }>;
    getProfileCompleteness: (userId: string) => Promise<number>;
    getPublicCandidates: (params: CandidateQueryParams) => Promise<{
        data: (mongoose.Document<unknown, {}, TUser, {}, {}> & TUser & Required<{
            _id: string;
        }> & {
            __v: number;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getPublicCandidateById: (id: string) => Promise<mongoose.Document<unknown, {}, TUser, {}, {}> & TUser & Required<{
        _id: string;
    }> & {
        __v: number;
    }>;
};
export {};
//# sourceMappingURL=user.services.d.ts.map