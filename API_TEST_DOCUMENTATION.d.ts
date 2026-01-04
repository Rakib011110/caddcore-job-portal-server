/**
 * JOB PORTAL API - COMPREHENSIVE TEST DOCUMENTATION
 *
 * This file contains all the API endpoints with complete JSON examples
 * for testing the Job Posting & Application System
 *
 * Base URL: http://localhost:5000/api
 */
/**
 * 1.1 CREATE A NEW JOB
 * POST /api/jobs
 * Content-Type: application/json
 */
declare const CREATE_JOB_REQUEST: {
    title: string;
    slug: string;
    description: string;
    companyName: string;
    companyLogoUrl: string;
    companyWebsite: string;
    jobType: string;
    experience: string;
    salaryCurrency: string;
    salaryMin: number;
    salaryMax: number;
    salaryShowInListing: boolean;
    salaryRange: string;
    category: string;
    specialization: string;
    location: string;
    locationType: string;
    countries: string[];
    vacancies: number;
    qualifications: string[];
    requiredSkills: string[];
    preferredSkills: string[];
    responsibilities: string[];
    benefits: string[];
    applicationDeadline: string;
    duration: string;
    aboutCompany: string;
    certificationsRequired: string[];
    languages: {
        name: string;
        level: string;
    }[];
    isActive: boolean;
    isFeatured: boolean;
    tags: string[];
};
/**
 * RESPONSE (201 Created)
 */
declare const CREATE_JOB_RESPONSE: {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        _id: string;
        title: string;
        slug: string;
        description: string;
        companyName: string;
        jobType: string;
        experience: string;
        salaryCurrency: string;
        salaryMin: number;
        salaryMax: number;
        salaryShowInListing: boolean;
        category: string;
        location: string;
        locationType: string;
        vacancies: number;
        isActive: boolean;
        isFeatured: boolean;
        createdAt: string;
        updatedAt: string;
    };
};
/**
 * 1.2 GET ALL JOBS (with optional filters)
 * GET /api/jobs
 * GET /api/jobs?category=Engineering&jobType=Full Time&location=Dhaka
 * GET /api/jobs?search=developer
 */
declare const GET_ALL_JOBS_RESPONSE: {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        _id: string;
        title: string;
        slug: string;
        companyName: string;
        jobType: string;
        location: string;
        locationType: string;
        category: string;
        vacancies: number;
        salaryMin: number;
        salaryMax: number;
        isActive: boolean;
        isFeatured: boolean;
        createdAt: string;
    }[];
};
/**
 * 1.3 GET SINGLE JOB BY SLUG
 * GET /api/jobs/:slug
 * Example: GET /api/jobs/senior-full-stack-developer-2024
 */
declare const GET_SINGLE_JOB_RESPONSE: {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        _id: string;
        title: string;
        slug: string;
        description: string;
        companyName: string;
        companyLogoUrl: string;
        companyWebsite: string;
        jobType: string;
        experience: string;
        salaryCurrency: string;
        salaryMin: number;
        salaryMax: number;
        salaryRange: string;
        category: string;
        specialization: string;
        location: string;
        locationType: string;
        countries: string[];
        vacancies: number;
        qualifications: string[];
        requiredSkills: string[];
        responsibilities: string[];
        benefits: string[];
        applicationDeadline: string;
        aboutCompany: string;
        languages: {
            name: string;
            level: string;
        }[];
        isActive: boolean;
        isFeatured: boolean;
        createdAt: string;
        updatedAt: string;
    };
};
/**
 * 1.4 UPDATE A JOB
 * PATCH /api/jobs/:id
 * Example: PATCH /api/jobs/507f1f77bcf86cd799439011
 */
declare const UPDATE_JOB_REQUEST: {
    title: string;
    vacancies: number;
    salaryMax: number;
    isFeatured: boolean;
    isActive: boolean;
};
declare const UPDATE_JOB_RESPONSE: {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        _id: string;
        title: string;
        vacancies: number;
        salaryMax: number;
        isFeatured: boolean;
        updatedAt: string;
    };
};
/**
 * 1.5 DELETE A JOB
 * DELETE /api/jobs/:id
 * Example: DELETE /api/jobs/507f1f77bcf86cd799439011
 */
declare const DELETE_JOB_RESPONSE: {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        _id: string;
        title: string;
        message: string;
    };
};
/**
 * 1.6 GET FEATURED JOBS
 * GET /api/jobs/featured/list
 * GET /api/jobs/featured/list?limit=10
 */
declare const GET_FEATURED_JOBS_RESPONSE: {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        _id: string;
        title: string;
        companyName: string;
        category: string;
        location: string;
        isFeatured: boolean;
        createdAt: string;
    }[];
};
/**
 * 1.7 GET JOBS BY COMPANY
 * GET /api/jobs/company/:companyName
 * Example: GET /api/jobs/company/TechCorp%20Solutions
 */
declare const GET_JOBS_BY_COMPANY_RESPONSE: {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        _id: string;
        title: string;
        companyName: string;
        category: string;
    }[];
};
/**
 * 2.1 APPLY FOR A JOB (WITH RESUME UPLOAD)
 * POST /api/job-applications/apply
 * Content-Type: multipart/form-data
 *
 * Form Fields:
 * - resume: [File] - PDF, DOC, or DOCX (Max 5MB)
 * - jobId: string
 * - firstName: string
 * - lastName: string
 * - email: string
 * - phoneNumber: string
 * - yearsOfExperience: number
 * - academicQualification: string
 * - universityName: string
 * - presentAddress: string
 * - presentCity: string
 * - presentCountry: string
 * - technicalSkills: string[] (JSON array)
 * - softSkills: string[] (JSON array)
 * - currentPosition: string (optional)
 * - currentCompany: string (optional)
 * - linkedinProfile: string (optional)
 * - portfolioUrl: string (optional)
 * - coverLetter: string (optional)
 * - certifications: string[] (optional)
 * - languages: object[] (optional)
 * - whyHireYou: string (optional)
 *
 * Example using curl:
 * curl -X POST http://localhost:5000/api/job-applications/apply \
 *   -F "resume=@/path/to/resume.pdf" \
 *   -F "jobId=507f1f77bcf86cd799439011" \
 *   -F "firstName=John" \
 *   -F "lastName=Doe" \
 *   -F "email=john.doe@example.com" \
 *   -F "phoneNumber=01712345678" \
 *   -F "yearsOfExperience=4" \
 *   -F "academicQualification=Bachelor of Science in Computer Engineering" \
 *   -F "universityName=BUET" \
 *   -F "presentAddress=123 Main Street" \
 *   -F "presentCity=Dhaka" \
 *   -F "presentCountry=Bangladesh" \
 *   -F "technicalSkills=[\"JavaScript\",\"React\",\"Node.js\",\"MongoDB\"]" \
 *   -F "softSkills=[\"Communication\",\"Problem Solving\",\"Team Work\"]" \
 *   -F "currentPosition=Senior Developer" \
 *   -F "currentCompany=ABC Corp" \
 *   -F "linkedinProfile=https://linkedin.com/in/johndoe" \
 *   -F "portfolioUrl=https://johndoe.com" \
 *   -F "coverLetter=I am very interested in this position..."
 */
declare const APPLY_JOB_REQUEST: {
    jobId: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    currentPosition: string;
    currentCompany: string;
    yearsOfExperience: number;
    linkedinProfile: string;
    portfolioUrl: string;
    websiteUrl: string;
    academicQualification: string;
    universityName: string;
    degreeTitle: string;
    graduationYear: number;
    presentAddress: string;
    presentCity: string;
    presentCountry: string;
    technicalSkills: string[];
    softSkills: string[];
    coverLetter: string;
    certifications: string[];
    languages: {
        name: string;
        proficiency: string;
    }[];
    whyHireYou: string;
    preferredEmploymentType: string;
    availableFrom: string;
    noticePeriod: string;
};
declare const APPLY_JOB_RESPONSE: {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        _id: string;
        jobId: string;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        currentPosition: string;
        currentCompany: string;
        yearsOfExperience: number;
        academicQualification: string;
        universityName: string;
        presentAddress: string;
        presentCity: string;
        presentCountry: string;
        resumeFileName: string;
        resumePath: string;
        resumeUrl: string;
        technicalSkills: string[];
        softSkills: string[];
        applicationStatus: string;
        appliedAt: string;
        createdAt: string;
        updatedAt: string;
    };
};
/**
 * 2.2 GET ALL APPLICATIONS FOR A SPECIFIC JOB (Candidate Details)
 * GET /api/job-applications/job/:jobId
 * Example: GET /api/job-applications/job/507f1f77bcf86cd799439011
 */
declare const GET_APPLICATIONS_FOR_JOB_RESPONSE: {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        _id: string;
        jobId: {
            _id: string;
            title: string;
            companyName: string;
            jobType: string;
            location: string;
        };
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        currentPosition: string;
        currentCompany: string;
        yearsOfExperience: number;
        academicQualification: string;
        universityName: string;
        presentCity: string;
        presentCountry: string;
        linkedinProfile: string;
        portfolioUrl: string;
        technicalSkills: string[];
        softSkills: string[];
        resumeUrl: string;
        applicationStatus: string;
        appliedAt: string;
    }[];
};
/**
 * 2.3 GET ALL APPLICATIONS (System-wide)
 * GET /api/job-applications
 */
declare const GET_ALL_APPLICATIONS_RESPONSE: {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        _id: string;
        jobId: {
            _id: string;
            title: string;
        };
        firstName: string;
        lastName: string;
        email: string;
        applicationStatus: string;
        appliedAt: string;
    }[];
};
/**
 * 2.4 GET SINGLE APPLICATION BY ID
 * GET /api/job-applications/:id
 * Example: GET /api/job-applications/507f1f77bcf86cd799439101
 */
declare const GET_SINGLE_APPLICATION_RESPONSE: {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        _id: string;
        jobId: {
            _id: string;
            title: string;
            companyName: string;
            jobType: string;
            location: string;
            salary: string;
        };
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string;
        currentPosition: string;
        currentCompany: string;
        yearsOfExperience: number;
        linkedinProfile: string;
        portfolioUrl: string;
        websiteUrl: string;
        academicQualification: string;
        universityName: string;
        degreeTitle: string;
        graduationYear: number;
        presentAddress: string;
        presentCity: string;
        presentCountry: string;
        technicalSkills: string[];
        softSkills: string[];
        coverLetter: string;
        certifications: string[];
        languages: {
            name: string;
            proficiency: string;
        }[];
        whyHireYou: string;
        preferredEmploymentType: string;
        availableFrom: string;
        noticePeriod: string;
        resumeFileName: string;
        resumePath: string;
        resumeUrl: string;
        applicationStatus: string;
        internalNotes: string;
        appliedAt: string;
        createdAt: string;
        updatedAt: string;
    };
};
/**
 * 2.5 UPDATE APPLICATION STATUS
 * PATCH /api/job-applications/:id/status
 * Example: PATCH /api/job-applications/507f1f77bcf86cd799439101/status
 */
declare const UPDATE_APPLICATION_STATUS_REQUEST: {
    applicationStatus: string;
};
declare const UPDATE_APPLICATION_STATUS_RESPONSE: {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        applicationStatus: string;
        updatedAt: string;
    };
};
/**
 * 2.6 ADD INTERNAL NOTES TO APPLICATION
 * PATCH /api/job-applications/:id/notes
 * Example: PATCH /api/job-applications/507f1f77bcf86cd799439101/notes
 */
declare const ADD_APPLICATION_NOTES_REQUEST: {
    internalNotes: string;
};
declare const ADD_APPLICATION_NOTES_RESPONSE: {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        internalNotes: string;
        updatedAt: string;
    };
};
/**
 * 2.7 DELETE APPLICATION
 * DELETE /api/job-applications/:id
 * Example: DELETE /api/job-applications/507f1f77bcf86cd799439101
 */
declare const DELETE_APPLICATION_RESPONSE: {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        _id: string;
        firstName: string;
        lastName: string;
        message: string;
    };
};
/**
 * 2.8 GET APPLICATIONS BY EMAIL
 * GET /api/job-applications/email/:email
 * Example: GET /api/job-applications/email/john.doe@example.com
 */
declare const GET_APPLICATIONS_BY_EMAIL_RESPONSE: {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        _id: string;
        jobId: {
            _id: string;
            title: string;
            companyName: string;
        };
        firstName: string;
        lastName: string;
        email: string;
        applicationStatus: string;
        appliedAt: string;
    }[];
};
/**
 * 2.9 SEARCH APPLICATIONS (with filters)
 * GET /api/job-applications/search
 * GET /api/job-applications/search?jobId=507f1f77bcf86cd799439011&applicationStatus=Shortlisted
 * GET /api/job-applications/search?email=john.doe@example.com
 * GET /api/job-applications/search?name=John
 */
declare const SEARCH_APPLICATIONS_RESPONSE: {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        _id: string;
        jobId: {
            _id: string;
            title: string;
        };
        firstName: string;
        lastName: string;
        email: string;
        applicationStatus: string;
    }[];
};
/**
 * 2.10 GET APPLICATION COUNT BY STATUS
 * GET /api/job-applications/job/:jobId/count-by-status
 * Example: GET /api/job-applications/job/507f1f77bcf86cd799439011/count-by-status
 */
declare const GET_APPLICATION_COUNT_BY_STATUS_RESPONSE: {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        _id: string;
        count: number;
    }[];
};
/**
 * 2.11 GET TOTAL APPLICATIONS COUNT FOR A JOB
 * GET /api/job-applications/job/:jobId/total-count
 * Example: GET /api/job-applications/job/507f1f77bcf86cd799439011/total-count
 */
declare const GET_TOTAL_APPLICATIONS_COUNT_RESPONSE: {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        count: number;
    };
};
/**
 * 3.1 GET JOBS COUNT BY CATEGORY
 * GET /api/jobs/analytics/count-by-category
 */
declare const GET_JOBS_COUNT_BY_CATEGORY_RESPONSE: {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        _id: string;
        count: number;
    }[];
};
/**
 * 3.2 GET TOTAL ACTIVE JOBS COUNT
 * GET /api/jobs/analytics/total-count
 */
declare const GET_TOTAL_JOBS_COUNT_RESPONSE: {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        count: number;
    };
};
/**
 * ERROR: Job Not Found (404)
 */
declare const ERROR_NOT_FOUND: {
    success: boolean;
    statusCode: number;
    message: string;
    data: null;
};
/**
 * ERROR: Invalid File Type (400)
 */
declare const ERROR_INVALID_FILE: {
    success: boolean;
    statusCode: number;
    message: string;
    data: null;
};
/**
 * ERROR: File Too Large (413)
 */
declare const ERROR_FILE_TOO_LARGE: {
    success: boolean;
    statusCode: number;
    message: string;
    data: null;
};
/**
 * ERROR: Missing Resume (400)
 */
declare const ERROR_MISSING_RESUME: {
    success: boolean;
    statusCode: number;
    message: string;
    data: null;
};
/**
 * ERROR: Validation Error (400)
 */
declare const ERROR_VALIDATION: {
    success: boolean;
    statusCode: number;
    message: string;
    data: {
        errors: {
            field: string;
            message: string;
        }[];
    };
};
/**
 * TESTING WORKFLOW:
 *
 * 1. Create a Job:
 *    POST /api/jobs
 *    Use: CREATE_JOB_REQUEST
 *    Save the returned _id for testing
 *
 * 2. Get All Jobs:
 *    GET /api/jobs
 *
 * 3. Get Single Job:
 *    GET /api/jobs/:slug
 *    Example: /api/jobs/senior-full-stack-developer-2024
 *
 * 4. Apply for Job (with resume upload):
 *    POST /api/job-applications/apply
 *    - Use multipart/form-data
 *    - Include a real PDF, DOC, or DOCX file
 *    - Use the jobId from step 1
 *
 * 5. Get Applications for Job:
 *    GET /api/job-applications/job/:jobId
 *    Use the jobId from step 1
 *
 * 6. Update Application Status:
 *    PATCH /api/job-applications/:applicationId/status
 *    Use applicationId from step 4
 *
 * 7. Get Application Details:
 *    GET /api/job-applications/:applicationId
 *
 * 8. Delete Application:
 *    DELETE /api/job-applications/:applicationId
 *
 * 9. Update Job:
 *    PATCH /api/jobs/:jobId
 *
 * 10. Delete Job:
 *     DELETE /api/jobs/:jobId
 */
export { CREATE_JOB_REQUEST, CREATE_JOB_RESPONSE, GET_ALL_JOBS_RESPONSE, GET_SINGLE_JOB_RESPONSE, UPDATE_JOB_REQUEST, UPDATE_JOB_RESPONSE, DELETE_JOB_RESPONSE, GET_FEATURED_JOBS_RESPONSE, GET_JOBS_BY_COMPANY_RESPONSE, APPLY_JOB_REQUEST, APPLY_JOB_RESPONSE, GET_APPLICATIONS_FOR_JOB_RESPONSE, GET_ALL_APPLICATIONS_RESPONSE, GET_SINGLE_APPLICATION_RESPONSE, UPDATE_APPLICATION_STATUS_REQUEST, UPDATE_APPLICATION_STATUS_RESPONSE, ADD_APPLICATION_NOTES_REQUEST, ADD_APPLICATION_NOTES_RESPONSE, DELETE_APPLICATION_RESPONSE, GET_APPLICATIONS_BY_EMAIL_RESPONSE, SEARCH_APPLICATIONS_RESPONSE, GET_APPLICATION_COUNT_BY_STATUS_RESPONSE, GET_TOTAL_APPLICATIONS_COUNT_RESPONSE, GET_JOBS_COUNT_BY_CATEGORY_RESPONSE, GET_TOTAL_JOBS_COUNT_RESPONSE, ERROR_NOT_FOUND, ERROR_INVALID_FILE, ERROR_FILE_TOO_LARGE, ERROR_MISSING_RESUME, ERROR_VALIDATION, };
//# sourceMappingURL=API_TEST_DOCUMENTATION.d.ts.map