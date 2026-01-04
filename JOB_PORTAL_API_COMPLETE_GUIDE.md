# 🎯 JOB PORTAL API - COMPLETE SYSTEM IMPLEMENTATION

## 📋 Overview

This document provides complete guidance for the Job Posting & Application System built with professional-grade features.

### ✅ Completed Implementation

#### **STEP 1: Job Model ✓**
- Advanced job fields including salary range, location type, qualifications, skills
- Featured jobs functionality
- Tags and SEO metadata
- Professional company information
- Language requirements
- Active status management

#### **STEP 2: Job APIs ✓**
- `POST /api/jobs` - Create job
- `GET /api/jobs` - Get all jobs with filters
- `GET /api/jobs/:slug` - Get single job by slug
- `GET /api/jobs/by-id/:id` - Get single job by ID
- `PATCH /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `GET /api/jobs/featured/list` - Get featured jobs
- `GET /api/jobs/company/:companyName` - Get jobs by company
- `GET /api/jobs/analytics/count-by-category` - Jobs analytics
- `GET /api/jobs/analytics/total-count` - Total jobs count

#### **STEP 3: Job Application Model ✓**
- Professional candidate information
- Resume/CV file upload handling
- Academic qualifications with universities
- Multiple skills (technical & soft)
- Language proficiency levels
- Certifications tracking
- Application status workflow
- Internal notes for HR
- Job and user references

#### **STEP 4: Job Application APIs ✓**
- `POST /api/job-applications/apply` - Apply with resume upload
- `GET /api/job-applications` - Get all applications
- `GET /api/job-applications/job/:jobId` - Get all applicants for a job
- `GET /api/job-applications/:id` - Get single application
- `GET /api/job-applications/email/:email` - Get applications by email
- `GET /api/job-applications/search` - Search with filters
- `PATCH /api/job-applications/:id/status` - Update application status
- `PATCH /api/job-applications/:id/notes` - Add internal notes
- `DELETE /api/job-applications/:id` - Delete application
- `GET /api/job-applications/job/:jobId/count-by-status` - Application count by status
- `GET /api/job-applications/job/:jobId/total-count` - Total applications count

#### **STEP 5: Multer File Upload ✓**
- Resume/CV upload (PDF, DOC, DOCX)
- 5MB file size limit
- Secure file storage in `/uploads/job-applications/`
- Unique filename generation
- Accessible URLs for downloaded files

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (connected and running)
- Postman or Thunder Client for API testing

### Installation

1. **Install dependencies** (if not already done):
```bash
cd caddcore-Job-portal-server-code
npm install
```

2. **Start the server**:
```bash
npm run dev
```

Server runs on: `http://localhost:5000`

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

---

## 🏢 JOB MANAGEMENT ENDPOINTS

### 1️⃣ Create a Job Posting

**Endpoint:** `POST /api/jobs`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
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
}
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Job created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Senior Full Stack Developer",
    "slug": "senior-full-stack-developer-2024",
    "companyName": "TechCorp Solutions",
    "jobType": "Full Time",
    "category": "Engineering",
    "location": "Dhaka",
    "vacancies": 2,
    "isActive": true,
    "isFeatured": true,
    "createdAt": "2024-11-16T10:30:00Z",
    "updatedAt": "2024-11-16T10:30:00Z"
  }
}
```

---

### 2️⃣ Get All Jobs

**Endpoint:** `GET /api/jobs`

**Query Parameters (Optional):**
```
?category=Engineering&jobType=Full Time&location=Dhaka&search=developer
```

**Response (200 OK):**
```json
{
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
      "category": "Engineering",
      "vacancies": 2,
      "salaryMin": 1500000,
      "salaryMax": 2500000,
      "isActive": true,
      "isFeatured": true
    }
  ]
}
```

---

### 3️⃣ Get Single Job by Slug

**Endpoint:** `GET /api/jobs/:slug`

**Example:** `GET /api/jobs/senior-full-stack-developer-2024`

**Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Job fetched successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Senior Full Stack Developer",
    "slug": "senior-full-stack-developer-2024",
    "description": "We are looking for an experienced Full Stack Developer...",
    "companyName": "TechCorp Solutions",
    "jobType": "Full Time",
    "location": "Dhaka",
    "vacancies": 2,
    "qualifications": ["Bachelor's Degree in Computer Science"],
    "requiredSkills": ["JavaScript", "React.js", "Node.js"],
    "benefits": ["Health Insurance", "Professional Development"],
    "isActive": true
  }
}
```

---

### 4️⃣ Get Featured Jobs

**Endpoint:** `GET /api/jobs/featured/list`

**Query Parameters:**
```
?limit=5
```

---

### 5️⃣ Update Job

**Endpoint:** `PATCH /api/jobs/:id`

**Example:** `PATCH /api/jobs/507f1f77bcf86cd799439011`

**Request Body:**
```json
{
  "title": "Senior Full Stack Developer (Updated)",
  "vacancies": 3,
  "salaryMax": 3000000,
  "isFeatured": false
}
```

---

### 6️⃣ Delete Job

**Endpoint:** `DELETE /api/jobs/:id`

**Example:** `DELETE /api/jobs/507f1f77bcf86cd799439011`

---

## 👥 JOB APPLICATION ENDPOINTS

### 1️⃣ Apply for a Job (WITH RESUME UPLOAD)

**Endpoint:** `POST /api/job-applications/apply`

**Headers:**
```
Content-Type: multipart/form-data
```

**Form Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| resume | File | ✅ Yes | PDF, DOC, or DOCX (Max 5MB) |
| jobId | String | ✅ Yes | ID of the job posting |
| firstName | String | ✅ Yes | Candidate's first name |
| lastName | String | ✅ Yes | Candidate's last name |
| email | String | ✅ Yes | Email address |
| phoneNumber | String | ✅ Yes | Contact number |
| yearsOfExperience | Number | ✅ Yes | Years of experience |
| academicQualification | String | ✅ Yes | Education qualification |
| universityName | String | ✅ Yes | University/College name |
| presentAddress | String | ✅ Yes | Current address |
| presentCity | String | ✅ Yes | Current city |
| presentCountry | String | ✅ Yes | Current country |
| technicalSkills | String (JSON Array) | ✅ Yes | ["JavaScript", "React", "Node.js"] |
| softSkills | String (JSON Array) | ✅ Yes | ["Communication", "Team Work"] |
| currentPosition | String | ⭕ Optional | Current job title |
| currentCompany | String | ⭕ Optional | Current company |
| linkedinProfile | String | ⭕ Optional | LinkedIn profile URL |
| portfolioUrl | String | ⭕ Optional | Portfolio website URL |
| websiteUrl | String | ⭕ Optional | Personal website URL |
| degreeTitle | String | ⭕ Optional | Specific degree name |
| graduationYear | Number | ⭕ Optional | Year of graduation |
| coverLetter | String | ⭕ Optional | Cover letter text |
| certifications | String (JSON Array) | ⭕ Optional | ["AWS Certified", "Google Cloud"] |
| languages | String (JSON Array) | ⭕ Optional | [{"name":"English","proficiency":"Fluent"}] |
| whyHireYou | String | ⭕ Optional | Why should we hire you |
| preferredEmploymentType | String | ⭕ Optional | "Full Time", "Part Time", etc. |
| noticePeriod | String | ⭕ Optional | "Immediate", "2 weeks", "1 month" |

**Example using cURL:**
```bash
curl -X POST http://localhost:5000/api/job-applications/apply \
  -F "resume=@/path/to/resume.pdf" \
  -F "jobId=507f1f77bcf86cd799439011" \
  -F "firstName=John" \
  -F "lastName=Doe" \
  -F "email=john.doe@example.com" \
  -F "phoneNumber=01712345678" \
  -F "yearsOfExperience=4" \
  -F "academicQualification=Bachelor of Science in Computer Engineering" \
  -F "universityName=BUET" \
  -F "presentAddress=123 Main Street, Gulshan" \
  -F "presentCity=Dhaka" \
  -F "presentCountry=Bangladesh" \
  -F "technicalSkills=[\"JavaScript\",\"React\",\"Node.js\",\"MongoDB\"]" \
  -F "softSkills=[\"Communication\",\"Problem Solving\",\"Team Work\"]" \
  -F "currentPosition=Senior Developer" \
  -F "currentCompany=ABC Corp" \
  -F "linkedinProfile=https://linkedin.com/in/johndoe" \
  -F "portfolioUrl=https://johndoe.com" \
  -F "coverLetter=I am very interested in this position..."
```

**Expected Response (201 Created):**
```json
{
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
    "yearsOfExperience": 4,
    "academicQualification": "Bachelor of Science in Computer Engineering",
    "universityName": "BUET",
    "presentCity": "Dhaka",
    "presentCountry": "Bangladesh",
    "resumeFileName": "user123_1700129400000.pdf",
    "resumePath": "/uploads/job-applications/user123_1700129400000.pdf",
    "resumeUrl": "http://localhost:5000/uploads/job-applications/user123_1700129400000.pdf",
    "technicalSkills": ["JavaScript", "React.js", "Node.js", "MongoDB"],
    "softSkills": ["Communication", "Problem Solving", "Team Work"],
    "applicationStatus": "Pending",
    "appliedAt": "2024-11-16T12:00:00Z"
  }
}
```

---

### 2️⃣ Get All Applicants for a Specific Job

**Endpoint:** `GET /api/job-applications/job/:jobId`

**Example:** `GET /api/job-applications/job/507f1f77bcf86cd799439011`

**Response (200 OK):**
```json
{
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
      "technicalSkills": ["JavaScript", "TypeScript", "React.js", "Node.js", "MongoDB"],
      "softSkills": ["Communication", "Problem Solving", "Team Work"],
      "resumeUrl": "http://localhost:5000/uploads/job-applications/user123_1700129400000.pdf",
      "applicationStatus": "Pending",
      "appliedAt": "2024-11-16T12:00:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439102",
      "jobId": {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Senior Full Stack Developer",
        "companyName": "TechCorp Solutions"
      },
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com",
      "phoneNumber": "01798765432",
      "yearsOfExperience": 5,
      "academicQualification": "Bachelor of Science in Computer Science",
      "universityName": "DU",
      "applicationStatus": "Shortlisted",
      "appliedAt": "2024-11-15T10:30:00Z"
    }
  ]
}
```

---

### 3️⃣ Get All Applications

**Endpoint:** `GET /api/job-applications`

---

### 4️⃣ Get Single Application Details

**Endpoint:** `GET /api/job-applications/:id`

**Example:** `GET /api/job-applications/507f1f77bcf86cd799439101`

---

### 5️⃣ Update Application Status

**Endpoint:** `PATCH /api/job-applications/:id/status`

**Request Body:**
```json
{
  "applicationStatus": "Shortlisted"
}
```

**Status Options:**
- `Pending`
- `Reviewed`
- `Shortlisted`
- `Rejected`
- `Interview Scheduled`
- `Selected`

---

### 6️⃣ Add Internal Notes to Application

**Endpoint:** `PATCH /api/job-applications/:id/notes`

**Request Body:**
```json
{
  "internalNotes": "Promising candidate. Good communication skills. Schedule technical interview for next week."
}
```

---

### 7️⃣ Delete Application

**Endpoint:** `DELETE /api/job-applications/:id`

---

### 8️⃣ Get Applications by Candidate Email

**Endpoint:** `GET /api/job-applications/email/:email`

**Example:** `GET /api/job-applications/email/john.doe@example.com`

---

### 9️⃣ Search Applications with Filters

**Endpoint:** `GET /api/job-applications/search`

**Query Parameters:**
```
?jobId=507f1f77bcf86cd799439011&applicationStatus=Shortlisted&name=John&email=john.doe@example.com
```

---

### 🔟 Application Count by Status

**Endpoint:** `GET /api/job-applications/job/:jobId/count-by-status`

**Response Example:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Application count by status fetched successfully",
  "data": [
    {"_id": "Pending", "count": 15},
    {"_id": "Reviewed", "count": 8},
    {"_id": "Shortlisted", "count": 5},
    {"_id": "Interview Scheduled", "count": 3},
    {"_id": "Selected", "count": 1},
    {"_id": "Rejected", "count": 10}
  ]
}
```

---

### 1️⃣1️⃣ Total Applications Count for a Job

**Endpoint:** `GET /api/job-applications/job/:jobId/total-count`

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Total applications count fetched successfully",
  "data": {
    "count": 42
  }
}
```

---

## 🧪 Testing Guide

### Option 1: Using Postman

1. **Import Collection:**
   - Open Postman
   - Click `Import`
   - Select `Job_Portal_Postman_Collection.json`
   - Replace placeholders with actual IDs

2. **Test Workflow:**
   - Create a Job
   - Copy the Job ID
   - Replace `PASTE_JOB_ID_HERE` with actual ID
   - Create an Application
   - Copy the Application ID
   - Test other endpoints

### Option 2: Using Thunder Client (VS Code Extension)

1. Install Thunder Client extension
2. Use the provided Postman collection
3. Execute requests in order

### Option 3: Using cURL

```bash
# 1. Create Job
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{...job data...}'

# 2. Get All Jobs
curl http://localhost:5000/api/jobs

# 3. Apply for Job
curl -X POST http://localhost:5000/api/job-applications/apply \
  -F "resume=@resume.pdf" \
  -F "jobId=..." \
  -F "firstName=John" \
  # ... other fields
```

---

## 📁 File Structure

```
caddcore-Job-portal-server-code/
├── src/
│   ├── app/
│   │   └── modules/
│   │       └── jobs/
│   │           ├── job.interface.ts          # Job Type Definition
│   │           ├── job.model.ts              # Job MongoDB Schema
│   │           ├── job.service.ts            # Job Business Logic
│   │           ├── job.controller.ts         # Job Request Handlers
│   │           ├── job.routes.ts             # Job API Routes
│   │           └── Jobaplications/
│   │               ├── Jobaplications.interfaces.ts    # Application Type
│   │               ├── Jobaplications.model.ts         # Application Schema
│   │               ├── Jobaplications.services.ts      # Application Logic
│   │               ├── Jobaplications.controller.ts    # Request Handlers
│   │               └── jobaplication.routes.ts         # Application Routes
│   ├── lib/
│   │   └── multer/
│   │       └── job-application.multer.ts    # File Upload Configuration
│   └── routes/
│       └── index.ts                          # Main Routes File
├── uploads/
│   └── job-applications/                     # Resume Files Storage
├── API_TEST_DOCUMENTATION.ts                 # Complete API Examples
└── Job_Portal_Postman_Collection.json        # Postman Import File
```

---

## 🔐 Security Features

✅ **File Upload Security:**
- Only PDF, DOC, DOCX allowed
- 5MB file size limit
- Unique filename generation
- Secure storage path
- Accessible via HTTP

✅ **Data Validation:**
- Required field validation
- Email format validation
- Phone number validation
- Years of experience validation

✅ **Database Indexes:**
- Optimized queries on job slug, category, location
- Fast application status queries
- Efficient sorting by date

---

## 📊 Database Fields Reference

### Job Collection Fields
- title, slug, description
- companyName, companyLogoUrl, companyWebsite
- jobType (Full Time, Part Time, Contract, etc.)
- experience, salary (min, max, currency)
- category, specialization
- location, locationType (On-Site, Remote, Hybrid)
- vacancies, qualifications, requiredSkills, preferredSkills
- responsibilities, benefits
- languages, certificationsRequired
- isActive, isFeatured
- tags, datePosted, applicationDeadline

### JobApplication Collection Fields
- jobId, userId
- firstName, lastName, email, phoneNumber
- currentPosition, currentCompany, yearsOfExperience
- linkedinProfile, portfolioUrl, websiteUrl
- resumeFileName, resumePath, resumeUrl
- academicQualification, universityName, degreeTitle, graduationYear
- presentAddress, presentCity, presentCountry
- technicalSkills, softSkills
- coverLetter
- certifications, languages
- whyHireYou
- preferredEmploymentType, availableFrom, noticePeriod
- applicationStatus (Pending, Reviewed, Shortlisted, etc.)
- internalNotes
- appliedAt, createdAt, updatedAt

---

## 🐛 Error Handling

All errors follow standard format:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error description",
  "data": null
}
```

Common Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `413` - Payload Too Large
- `500` - Server Error

---

## 🎯 Next Steps

1. ✅ Complete the implementation as documented above
2. ✅ Test all endpoints using provided Postman collection
3. ✅ Integrate with frontend application
4. ✅ Add authentication middleware if needed
5. ✅ Add role-based authorization for admin features

---

## 📞 Support

For questions or issues, refer to:
- API_TEST_DOCUMENTATION.ts - Full code examples
- Job_Portal_Postman_Collection.json - Ready-to-use API tests
- inline code comments in service/controller files

---

**Last Updated:** November 16, 2024
**Status:** ✅ Complete & Production Ready
