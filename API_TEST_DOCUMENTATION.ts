/**
 * JOB PORTAL API - COMPREHENSIVE TEST DOCUMENTATION
 * 
 * This file contains all the API endpoints with complete JSON examples
 * for testing the Job Posting & Application System
 * 
 * Base URL: http://localhost:5000/api
 */

// ============================================================
// STEP 1: JOB MANAGEMENT ENDPOINTS
// ============================================================

/**
 * 1.1 CREATE A NEW JOB
 * POST /api/jobs
 * Content-Type: application/json
 */
const CREATE_JOB_REQUEST = {
  "title": "Senior Full Stack Developer",
  "slug": "senior-full-stack-developer-2024",
  "description": "We are looking for an experienced Full Stack Developer to join our growing team. You will work on building scalable web applications using modern technologies.",
  "companyName": "TechCorp Solutions",
  "companyLogoUrl": "https://example.com/logo.png",
  "companyWebsite": "https://techcorp.com",
  "jobType": "Full Time",
  "experience": "3-5 years",
  "salaryCurrency": "BDT",
  "salaryMin": 1500000,
  "salaryMax": 2500000,
  "salaryShowInListing": true,
  "salaryRange": "15,00,000 - 25,00,000 BDT",
  "category": "Engineering",
  "specialization": "Full Stack Developer",
  "location": "Dhaka",
  "locationType": "Hybrid",
  "countries": ["Bangladesh", "Remote-Allowed"],
  "vacancies": 2,
  "qualifications": [
    "Bachelor's Degree in Computer Science or related field",
    "3-5 years of professional development experience"
  ],
  "requiredSkills": [
    "JavaScript/TypeScript",
    "React.js",
    "Node.js",
    "MongoDB",
    "RESTful APIs",
    "Git"
  ],
  "preferredSkills": [
    "Next.js",
    "AWS",
    "Docker",
    "Kubernetes",
    "GraphQL"
  ],
  "responsibilities": [
    "Design and develop scalable web applications",
    "Collaborate with cross-functional teams",
    "Write clean and maintainable code",
    "Participate in code reviews",
    "Contribute to technical documentation"
  ],
  "benefits": [
    "Competitive Salary",
    "Health Insurance",
    "Professional Development Fund",
    "Paid Time Off",
    "Flexible Working Hours",
    "Remote Work Options"
  ],
  "applicationDeadline": "2024-12-31T23:59:59Z",
  "duration": "Full-time, Permanent",
  "aboutCompany": "TechCorp Solutions is a leading software development company specializing in web applications and cloud solutions.",
  "certificationsRequired": [
    "AWS Solutions Architect (Optional)",
    "Azure Fundamentals (Optional)"
  ],
  "languages": [
    {
      "name": "English",
      "level": "Fluent"
    },
    {
      "name": "Bengali",
      "level": "Native"
    }
  ],
  "isActive": true,
  "isFeatured": true,
  "tags": [
    "full-stack",
    "react",
    "nodejs",
    "javascript",
    "remote-friendly"
  ]
};

/**
 * RESPONSE (201 Created)
 */
const CREATE_JOB_RESPONSE = {
  "success": true,
  "statusCode": 201,
  "message": "Job created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Senior Full Stack Developer",
    "slug": "senior-full-stack-developer-2024",
    "description": "We are looking for an experienced Full Stack Developer...",
    "companyName": "TechCorp Solutions",
    "jobType": "Full Time",
    "experience": "3-5 years",
    "salaryCurrency": "BDT",
    "salaryMin": 1500000,
    "salaryMax": 2500000,
    "salaryShowInListing": true,
    "category": "Engineering",
    "location": "Dhaka",
    "locationType": "Hybrid",
    "vacancies": 2,
    "isActive": true,
    "isFeatured": true,
    "createdAt": "2024-11-16T10:30:00Z",
    "updatedAt": "2024-11-16T10:30:00Z"
  }
};

// ============================================================

/**
 * 1.2 GET ALL JOBS (with optional filters)
 * GET /api/jobs
 * GET /api/jobs?category=Engineering&jobType=Full Time&location=Dhaka
 * GET /api/jobs?search=developer
 */
const GET_ALL_JOBS_RESPONSE = {
  "success": true,
  "statusCode": 200,
  "message": "All jobs fetched successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Senior Full Stack Developer",
      "slug": "senior-full-stack-developer-2024",
      "companyName": "TechCorp Solutions",
      "jobType": "Full Time",
      "location": "Dhaka",
      "locationType": "Hybrid",
      "category": "Engineering",
      "vacancies": 2,
      "salaryMin": 1500000,
      "salaryMax": 2500000,
      "isActive": true,
      "isFeatured": true,
      "createdAt": "2024-11-16T10:30:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "UI/UX Designer",
      "slug": "uiux-designer-2024",
      "companyName": "DesignHub",
      "jobType": "Full Time",
      "location": "Remote",
      "locationType": "Remote",
      "category": "Design",
      "vacancies": 1,
      "salaryMin": 800000,
      "salaryMax": 1200000,
      "isActive": true,
      "isFeatured": false,
      "createdAt": "2024-11-15T08:00:00Z"
    }
  ]
};

// ============================================================

/**
 * 1.3 GET SINGLE JOB BY SLUG
 * GET /api/jobs/:slug
 * Example: GET /api/jobs/senior-full-stack-developer-2024
 */
const GET_SINGLE_JOB_RESPONSE = {
  "success": true,
  "statusCode": 200,
  "message": "Job fetched successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Senior Full Stack Developer",
    "slug": "senior-full-stack-developer-2024",
    "description": "We are looking for an experienced Full Stack Developer...",
    "companyName": "TechCorp Solutions",
    "companyLogoUrl": "https://example.com/logo.png",
    "companyWebsite": "https://techcorp.com",
    "jobType": "Full Time",
    "experience": "3-5 years",
    "salaryCurrency": "BDT",
    "salaryMin": 1500000,
    "salaryMax": 2500000,
    "salaryRange": "15,00,000 - 25,00,000 BDT",
    "category": "Engineering",
    "specialization": "Full Stack Developer",
    "location": "Dhaka",
    "locationType": "Hybrid",
    "countries": ["Bangladesh", "Remote-Allowed"],
    "vacancies": 2,
    "qualifications": [
      "Bachelor's Degree in Computer Science or related field",
      "3-5 years of professional development experience"
    ],
    "requiredSkills": [
      "JavaScript/TypeScript",
      "React.js",
      "Node.js",
      "MongoDB"
    ],
    "responsibilities": [
      "Design and develop scalable web applications",
      "Collaborate with cross-functional teams"
    ],
    "benefits": [
      "Competitive Salary",
      "Health Insurance",
      "Professional Development Fund"
    ],
    "applicationDeadline": "2024-12-31T23:59:59Z",
    "aboutCompany": "TechCorp Solutions is a leading software development company...",
    "languages": [
      {
        "name": "English",
        "level": "Fluent"
      }
    ],
    "isActive": true,
    "isFeatured": true,
    "createdAt": "2024-11-16T10:30:00Z",
    "updatedAt": "2024-11-16T10:30:00Z"
  }
};

// ============================================================

/**
 * 1.4 UPDATE A JOB
 * PATCH /api/jobs/:id
 * Example: PATCH /api/jobs/507f1f77bcf86cd799439011
 */
const UPDATE_JOB_REQUEST = {
  "title": "Senior Full Stack Developer (Updated)",
  "vacancies": 3,
  "salaryMax": 3000000,
  "isFeatured": false,
  "isActive": true
};

const UPDATE_JOB_RESPONSE = {
  "success": true,
  "statusCode": 200,
  "message": "Job updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Senior Full Stack Developer (Updated)",
    "vacancies": 3,
    "salaryMax": 3000000,
    "isFeatured": false,
    "updatedAt": "2024-11-16T11:45:00Z"
  }
};

// ============================================================

/**
 * 1.5 DELETE A JOB
 * DELETE /api/jobs/:id
 * Example: DELETE /api/jobs/507f1f77bcf86cd799439011
 */
const DELETE_JOB_RESPONSE = {
  "success": true,
  "statusCode": 200,
  "message": "Job deleted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Senior Full Stack Developer",
    "message": "Job and all associated applications have been removed"
  }
};

// ============================================================

/**
 * 1.6 GET FEATURED JOBS
 * GET /api/jobs/featured/list
 * GET /api/jobs/featured/list?limit=10
 */
const GET_FEATURED_JOBS_RESPONSE = {
  "success": true,
  "statusCode": 200,
  "message": "Featured jobs fetched successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Senior Full Stack Developer",
      "companyName": "TechCorp Solutions",
      "category": "Engineering",
      "location": "Dhaka",
      "isFeatured": true,
      "createdAt": "2024-11-16T10:30:00Z"
    }
  ]
};

// ============================================================

/**
 * 1.7 GET JOBS BY COMPANY
 * GET /api/jobs/company/:companyName
 * Example: GET /api/jobs/company/TechCorp%20Solutions
 */
const GET_JOBS_BY_COMPANY_RESPONSE = {
  "success": true,
  "statusCode": 200,
  "message": "Company jobs fetched successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Senior Full Stack Developer",
      "companyName": "TechCorp Solutions",
      "category": "Engineering"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "title": "Junior Developer",
      "companyName": "TechCorp Solutions",
      "category": "Engineering"
    }
  ]
};

// ============================================================
// STEP 2: JOB APPLICATION ENDPOINTS
// ============================================================

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
const APPLY_JOB_REQUEST = {
  // Note: This is the JSON body representation
  // In actual multipart request, fields are form data
  "jobId": "507f1f77bcf86cd799439011",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "01712345678",
  "currentPosition": "Senior Developer",
  "currentCompany": "ABC Corp",
  "yearsOfExperience": 4,
  "linkedinProfile": "https://linkedin.com/in/johndoe",
  "portfolioUrl": "https://johndoe.com",
  "websiteUrl": "https://johndoe.dev",
  "academicQualification": "Bachelor of Science in Computer Engineering",
  "universityName": "BUET",
  "degreeTitle": "B.Sc in Computer Engineering",
  "graduationYear": 2019,
  "presentAddress": "123 Main Street, Gulshan",
  "presentCity": "Dhaka",
  "presentCountry": "Bangladesh",
  "technicalSkills": [
    "JavaScript",
    "TypeScript",
    "React.js",
    "Node.js",
    "MongoDB",
    "PostgreSQL",
    "Docker",
    "AWS"
  ],
  "softSkills": [
    "Communication",
    "Problem Solving",
    "Team Work",
    "Leadership",
    "Time Management"
  ],
  "coverLetter": "I am very interested in this Senior Full Stack Developer position. With 4 years of experience in full stack development using modern technologies like React, Node.js, and MongoDB, I am confident that I can contribute significantly to your team. I have successfully delivered multiple scalable applications and have a strong passion for writing clean, maintainable code.",
  "certifications": [
    "AWS Solutions Architect Associate",
    "Google Cloud Associate Cloud Engineer"
  ],
  "languages": [
    {
      "name": "English",
      "proficiency": "Fluent"
    },
    {
      "name": "Bengali",
      "proficiency": "Native"
    }
  ],
  "whyHireYou": "I can bring extensive full-stack experience, quick learning ability, and passion for technology to your team. I have a proven track record of delivering high-quality code and have experience with the exact tech stack mentioned in the job description.",
  "preferredEmploymentType": "Full Time",
  "availableFrom": "2024-12-01T00:00:00Z",
  "noticePeriod": "2 weeks"
};

const APPLY_JOB_RESPONSE = {
  "success": true,
  "statusCode": 201,
  "message": "Application submitted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439101",
    "jobId": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "01712345678",
    "currentPosition": "Senior Developer",
    "currentCompany": "ABC Corp",
    "yearsOfExperience": 4,
    "academicQualification": "Bachelor of Science in Computer Engineering",
    "universityName": "BUET",
    "presentAddress": "123 Main Street, Gulshan",
    "presentCity": "Dhaka",
    "presentCountry": "Bangladesh",
    "resumeFileName": "user123_1700129400000.pdf",
    "resumePath": "/uploads/job-applications/user123_1700129400000.pdf",
    "resumeUrl": "http://localhost:5000/uploads/job-applications/user123_1700129400000.pdf",
    "technicalSkills": [
      "JavaScript",
      "TypeScript",
      "React.js",
      "Node.js",
      "MongoDB"
    ],
    "softSkills": [
      "Communication",
      "Problem Solving",
      "Team Work"
    ],
    "applicationStatus": "Pending",
    "appliedAt": "2024-11-16T12:00:00Z",
    "createdAt": "2024-11-16T12:00:00Z",
    "updatedAt": "2024-11-16T12:00:00Z"
  }
};

// ============================================================

/**
 * 2.2 GET ALL APPLICATIONS FOR A SPECIFIC JOB (Candidate Details)
 * GET /api/job-applications/job/:jobId
 * Example: GET /api/job-applications/job/507f1f77bcf86cd799439011
 */
const GET_APPLICATIONS_FOR_JOB_RESPONSE = {
  "success": true,
  "statusCode": 200,
  "message": "Applications fetched successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439101",
      "jobId": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Senior Full Stack Developer",
        "companyName": "TechCorp Solutions",
        "jobType": "Full Time",
        "location": "Dhaka"
      },
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phoneNumber": "01712345678",
      "currentPosition": "Senior Developer",
      "currentCompany": "ABC Corp",
      "yearsOfExperience": 4,
      "academicQualification": "Bachelor of Science in Computer Engineering",
      "universityName": "BUET",
      "presentCity": "Dhaka",
      "presentCountry": "Bangladesh",
      "linkedinProfile": "https://linkedin.com/in/johndoe",
      "portfolioUrl": "https://johndoe.com",
      "technicalSkills": [
        "JavaScript",
        "TypeScript",
        "React.js",
        "Node.js",
        "MongoDB"
      ],
      "softSkills": [
        "Communication",
        "Problem Solving",
        "Team Work"
      ],
      "resumeUrl": "http://localhost:5000/uploads/job-applications/user123_1700129400000.pdf",
      "applicationStatus": "Pending",
      "appliedAt": "2024-11-16T12:00:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439102",
      "jobId": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Senior Full Stack Developer",
        "companyName": "TechCorp Solutions",
        "jobType": "Full Time",
        "location": "Dhaka"
      },
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com",
      "phoneNumber": "01798765432",
      "currentPosition": "Full Stack Developer",
      "currentCompany": "XYZ Tech",
      "yearsOfExperience": 5,
      "academicQualification": "Bachelor of Science in Computer Science",
      "universityName": "DU",
      "presentCity": "Dhaka",
      "presentCountry": "Bangladesh",
      "linkedinProfile": "https://linkedin.com/in/janesmith",
      "portfolioUrl": "https://janesmith.dev",
      "technicalSkills": [
        "JavaScript",
        "React.js",
        "Node.js",
        "PostgreSQL",
        "Docker"
      ],
      "softSkills": [
        "Leadership",
        "Communication",
        "Mentoring"
      ],
      "resumeUrl": "http://localhost:5000/uploads/job-applications/user456_1700129500000.pdf",
      "applicationStatus": "Shortlisted",
      "appliedAt": "2024-11-15T10:30:00Z"
    }
  ]
};

// ============================================================

/**
 * 2.3 GET ALL APPLICATIONS (System-wide)
 * GET /api/job-applications
 */
const GET_ALL_APPLICATIONS_RESPONSE = {
  "success": true,
  "statusCode": 200,
  "message": "All applications fetched successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439101",
      "jobId": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Senior Full Stack Developer"
      },
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "applicationStatus": "Pending",
      "appliedAt": "2024-11-16T12:00:00Z"
    }
  ]
};

// ============================================================

/**
 * 2.4 GET SINGLE APPLICATION BY ID
 * GET /api/job-applications/:id
 * Example: GET /api/job-applications/507f1f77bcf86cd799439101
 */
const GET_SINGLE_APPLICATION_RESPONSE = {
  "success": true,
  "statusCode": 200,
  "message": "Application fetched successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439101",
    "jobId": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Senior Full Stack Developer",
      "companyName": "TechCorp Solutions",
      "jobType": "Full Time",
      "location": "Dhaka",
      "salary": "15,00,000 - 25,00,000 BDT"
    },
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "01712345678",
    "currentPosition": "Senior Developer",
    "currentCompany": "ABC Corp",
    "yearsOfExperience": 4,
    "linkedinProfile": "https://linkedin.com/in/johndoe",
    "portfolioUrl": "https://johndoe.com",
    "websiteUrl": "https://johndoe.dev",
    "academicQualification": "Bachelor of Science in Computer Engineering",
    "universityName": "BUET",
    "degreeTitle": "B.Sc in Computer Engineering",
    "graduationYear": 2019,
    "presentAddress": "123 Main Street, Gulshan",
    "presentCity": "Dhaka",
    "presentCountry": "Bangladesh",
    "technicalSkills": [
      "JavaScript",
      "TypeScript",
      "React.js",
      "Node.js",
      "MongoDB"
    ],
    "softSkills": [
      "Communication",
      "Problem Solving",
      "Team Work"
    ],
    "coverLetter": "I am very interested in this position...",
    "certifications": [
      "AWS Solutions Architect Associate"
    ],
    "languages": [
      {
        "name": "English",
        "proficiency": "Fluent"
      }
    ],
    "whyHireYou": "I can bring extensive full-stack experience...",
    "preferredEmploymentType": "Full Time",
    "availableFrom": "2024-12-01T00:00:00Z",
    "noticePeriod": "2 weeks",
    "resumeFileName": "user123_1700129400000.pdf",
    "resumePath": "/uploads/job-applications/user123_1700129400000.pdf",
    "resumeUrl": "http://localhost:5000/uploads/job-applications/user123_1700129400000.pdf",
    "applicationStatus": "Pending",
    "internalNotes": "Promising candidate, good tech background",
    "appliedAt": "2024-11-16T12:00:00Z",
    "createdAt": "2024-11-16T12:00:00Z",
    "updatedAt": "2024-11-16T12:00:00Z"
  }
};

// ============================================================

/**
 * 2.5 UPDATE APPLICATION STATUS
 * PATCH /api/job-applications/:id/status
 * Example: PATCH /api/job-applications/507f1f77bcf86cd799439101/status
 */
const UPDATE_APPLICATION_STATUS_REQUEST = {
  "applicationStatus": "Shortlisted"
  // Options: "Pending", "Reviewed", "Shortlisted", "Rejected", "Interview Scheduled", "Selected"
};

const UPDATE_APPLICATION_STATUS_RESPONSE = {
  "success": true,
  "statusCode": 200,
  "message": "Application status updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439101",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "applicationStatus": "Shortlisted",
    "updatedAt": "2024-11-16T13:00:00Z"
  }
};

// ============================================================

/**
 * 2.6 ADD INTERNAL NOTES TO APPLICATION
 * PATCH /api/job-applications/:id/notes
 * Example: PATCH /api/job-applications/507f1f77bcf86cd799439101/notes
 */
const ADD_APPLICATION_NOTES_REQUEST = {
  "internalNotes": "Candidate has excellent communication skills. Schedule technical interview for next week. Check their GitHub portfolio before interview."
};

const ADD_APPLICATION_NOTES_RESPONSE = {
  "success": true,
  "statusCode": 200,
  "message": "Notes added successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439101",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "internalNotes": "Candidate has excellent communication skills. Schedule technical interview for next week. Check their GitHub portfolio before interview.",
    "updatedAt": "2024-11-16T13:15:00Z"
  }
};

// ============================================================

/**
 * 2.7 DELETE APPLICATION
 * DELETE /api/job-applications/:id
 * Example: DELETE /api/job-applications/507f1f77bcf86cd799439101
 */
const DELETE_APPLICATION_RESPONSE = {
  "success": true,
  "statusCode": 200,
  "message": "Application deleted successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439101",
    "firstName": "John",
    "lastName": "Doe",
    "message": "Application has been removed from the system"
  }
};

// ============================================================

/**
 * 2.8 GET APPLICATIONS BY EMAIL
 * GET /api/job-applications/email/:email
 * Example: GET /api/job-applications/email/john.doe@example.com
 */
const GET_APPLICATIONS_BY_EMAIL_RESPONSE = {
  "success": true,
  "statusCode": 200,
  "message": "Applications fetched successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439101",
      "jobId": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Senior Full Stack Developer",
        "companyName": "TechCorp Solutions"
      },
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "applicationStatus": "Shortlisted",
      "appliedAt": "2024-11-16T12:00:00Z"
    }
  ]
};

// ============================================================

/**
 * 2.9 SEARCH APPLICATIONS (with filters)
 * GET /api/job-applications/search
 * GET /api/job-applications/search?jobId=507f1f77bcf86cd799439011&applicationStatus=Shortlisted
 * GET /api/job-applications/search?email=john.doe@example.com
 * GET /api/job-applications/search?name=John
 */
const SEARCH_APPLICATIONS_RESPONSE = {
  "success": true,
  "statusCode": 200,
  "message": "Applications fetched successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439101",
      "jobId": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Senior Full Stack Developer"
      },
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "applicationStatus": "Shortlisted"
    }
  ]
};

// ============================================================

/**
 * 2.10 GET APPLICATION COUNT BY STATUS
 * GET /api/job-applications/job/:jobId/count-by-status
 * Example: GET /api/job-applications/job/507f1f77bcf86cd799439011/count-by-status
 */
const GET_APPLICATION_COUNT_BY_STATUS_RESPONSE = {
  "success": true,
  "statusCode": 200,
  "message": "Application count by status fetched successfully",
  "data": [
    {
      "_id": "Pending",
      "count": 15
    },
    {
      "_id": "Reviewed",
      "count": 8
    },
    {
      "_id": "Shortlisted",
      "count": 5
    },
    {
      "_id": "Interview Scheduled",
      "count": 3
    },
    {
      "_id": "Selected",
      "count": 1
    },
    {
      "_id": "Rejected",
      "count": 10
    }
  ]
};

// ============================================================

/**
 * 2.11 GET TOTAL APPLICATIONS COUNT FOR A JOB
 * GET /api/job-applications/job/:jobId/total-count
 * Example: GET /api/job-applications/job/507f1f77bcf86cd799439011/total-count
 */
const GET_TOTAL_APPLICATIONS_COUNT_RESPONSE = {
  "success": true,
  "statusCode": 200,
  "message": "Total applications count fetched successfully",
  "data": {
    "count": 42
  }
};

// ============================================================
// ANALYTICS & ADDITIONAL ENDPOINTS
// ============================================================

/**
 * 3.1 GET JOBS COUNT BY CATEGORY
 * GET /api/jobs/analytics/count-by-category
 */
const GET_JOBS_COUNT_BY_CATEGORY_RESPONSE = {
  "success": true,
  "statusCode": 200,
  "message": "Jobs count by category fetched successfully",
  "data": [
    {
      "_id": "Engineering",
      "count": 25
    },
    {
      "_id": "Design",
      "count": 12
    },
    {
      "_id": "Sales & Marketing",
      "count": 8
    },
    {
      "_id": "Human Resources",
      "count": 5
    }
  ]
};

// ============================================================

/**
 * 3.2 GET TOTAL ACTIVE JOBS COUNT
 * GET /api/jobs/analytics/total-count
 */
const GET_TOTAL_JOBS_COUNT_RESPONSE = {
  "success": true,
  "statusCode": 200,
  "message": "Total jobs count fetched successfully",
  "data": {
    "count": 50
  }
};

// ============================================================
// ERROR RESPONSES
// ============================================================

/**
 * ERROR: Job Not Found (404)
 */
const ERROR_NOT_FOUND = {
  "success": false,
  "statusCode": 404,
  "message": "Job not found",
  "data": null
};

/**
 * ERROR: Invalid File Type (400)
 */
const ERROR_INVALID_FILE = {
  "success": false,
  "statusCode": 400,
  "message": "Invalid file type. Only PDF, DOC, and DOCX files are allowed. Received: image/jpeg",
  "data": null
};

/**
 * ERROR: File Too Large (413)
 */
const ERROR_FILE_TOO_LARGE = {
  "success": false,
  "statusCode": 413,
  "message": "File size exceeds 5MB limit",
  "data": null
};

/**
 * ERROR: Missing Resume (400)
 */
const ERROR_MISSING_RESUME = {
  "success": false,
  "statusCode": 400,
  "message": "Resume file is required",
  "data": null
};

/**
 * ERROR: Validation Error (400)
 */
const ERROR_VALIDATION = {
  "success": false,
  "statusCode": 400,
  "message": "Validation error",
  "data": {
    "errors": [
      {
        "field": "email",
        "message": "Invalid email format"
      },
      {
        "field": "phoneNumber",
        "message": "Phone number is required"
      }
    ]
  }
};

// ============================================================
// QUICK TEST GUIDE
// ============================================================

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

export {
  CREATE_JOB_REQUEST,
  CREATE_JOB_RESPONSE,
  GET_ALL_JOBS_RESPONSE,
  GET_SINGLE_JOB_RESPONSE,
  UPDATE_JOB_REQUEST,
  UPDATE_JOB_RESPONSE,
  DELETE_JOB_RESPONSE,
  GET_FEATURED_JOBS_RESPONSE,
  GET_JOBS_BY_COMPANY_RESPONSE,
  APPLY_JOB_REQUEST,
  APPLY_JOB_RESPONSE,
  GET_APPLICATIONS_FOR_JOB_RESPONSE,
  GET_ALL_APPLICATIONS_RESPONSE,
  GET_SINGLE_APPLICATION_RESPONSE,
  UPDATE_APPLICATION_STATUS_REQUEST,
  UPDATE_APPLICATION_STATUS_RESPONSE,
  ADD_APPLICATION_NOTES_REQUEST,
  ADD_APPLICATION_NOTES_RESPONSE,
  DELETE_APPLICATION_RESPONSE,
  GET_APPLICATIONS_BY_EMAIL_RESPONSE,
  SEARCH_APPLICATIONS_RESPONSE,
  GET_APPLICATION_COUNT_BY_STATUS_RESPONSE,
  GET_TOTAL_APPLICATIONS_COUNT_RESPONSE,
  GET_JOBS_COUNT_BY_CATEGORY_RESPONSE,
  GET_TOTAL_JOBS_COUNT_RESPONSE,
  ERROR_NOT_FOUND,
  ERROR_INVALID_FILE,
  ERROR_FILE_TOO_LARGE,
  ERROR_MISSING_RESUME,
  ERROR_VALIDATION,
};
