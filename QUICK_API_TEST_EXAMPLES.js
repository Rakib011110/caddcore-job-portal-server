// /**
//  * JOB PORTAL API - QUICK TEST EXAMPLES
//  * Copy-paste these JSON examples directly into Postman
//  */

// // ============================================================
// // COMPLETE TEST EXAMPLE #1: CREATE JOB + APPLY + VIEW APPLICANTS
// // ============================================================

// /**
//  * STEP 1: CREATE A JOB
//  * POST http://localhost:5000/api/jobs
//  * 
//  * Copy this entire JSON and paste as raw body in Postman
//  */
// {
//   "title": "Frontend Developer",
//   "slug": "frontend-developer-2024",
//   "description": "We are looking for a talented Frontend Developer with strong React expertise to join our dynamic team. You will be responsible for building responsive, user-friendly interfaces for our web applications.",
//   "companyName": "Digital Innovation Labs",
//   "companyLogoUrl": "https://example.com/logo.png",
//   "companyWebsite": "https://innovationlabs.com",
//   "jobType": "Full Time",
//   "experience": "2-4 years",
//   "salaryCurrency": "BDT",
//   "salaryMin": 1000000,
//   "salaryMax": 1800000,
//   "salaryShowInListing": true,
//   "salaryRange": "10,00,000 - 18,00,000 BDT",
//   "category": "Engineering",
//   "specialization": "Frontend Development",
//   "location": "Dhaka",
//   "locationType": "Hybrid",
//   "countries": ["Bangladesh"],
//   "vacancies": 3,
//   "qualifications": [
//     "Bachelor's Degree in Computer Science or related field",
//     "2-4 years of professional development experience",
//     "Strong understanding of React.js and modern JavaScript"
//   ],
//   "requiredSkills": [
//     "React.js",
//     "JavaScript/TypeScript",
//     "HTML/CSS",
//     "REST APIs",
//     "Git Version Control"
//   ],
//   "preferredSkills": [
//     "Next.js",
//     "Redux",
//     "Material-UI or Tailwind CSS",
//     "Testing (Jest, React Testing Library)"
//   ],
//   "responsibilities": [
//     "Develop and maintain frontend components using React.js",
//     "Collaborate with designers and backend developers",
//     "Optimize application performance",
//     "Write unit and integration tests",
//     "Participate in code reviews and documentation"
//   ],
//   "benefits": [
//     "Competitive Salary",
//     "Health Insurance Coverage",
//     "Professional Development Fund",
//     "Paid Annual Leave",
//     "Flexible Working Hours",
//     "Performance Bonus"
//   ],
//   "applicationDeadline": "2024-12-31T23:59:59Z",
//   "duration": "Full-time, Permanent",
//   "aboutCompany": "Digital Innovation Labs is a forward-thinking software company specializing in web and mobile solutions for startups and enterprises.",
//   "certificationsRequired": [],
//   "languages": [
//     {
//       "name": "English",
//       "level": "Fluent"
//     }
//   ],
//   "isActive": true,
//   "isFeatured": true,
//   "tags": ["react", "frontend", "javascript", "remote-friendly"]
// }

// /**
//  * RESPONSE: After creating the job, you'll get a response like:
//  * {
//  *   "_id": "COPY_THIS_JOB_ID_FOR_NEXT_STEP"
//  * }
//  */

// // ============================================================

// /**
//  * STEP 2: APPLY FOR THE JOB (WITH RESUME)
//  * POST http://localhost:5000/api/job-applications/apply
//  * Content-Type: multipart/form-data
//  * 
//  * In Postman:
//  * 1. Change to multipart/form-data in Body tab
//  * 2. Add fields below
//  * 3. Select "File" type for "resume" field
//  * 4. Choose your PDF/DOC resume file
//  * 5. Send
//  */

// Form Data (key-value pairs):
//   resume: [Select your resume.pdf file]
//   jobId: [PASTE_JOB_ID_FROM_STEP_1_HERE]
//   firstName: Ahmed
//   lastName: Khan
//   email: ahmed.khan@example.com
//   phoneNumber: 01798765432
//   currentPosition: Junior Frontend Developer
//   currentCompany: TechStart Bangladesh
//   yearsOfExperience: 3
//   linkedinProfile: https://linkedin.com/in/ahmadkhan
//   portfolioUrl: https://ahmadkhan-portfolio.netlify.app
//   academicQualification: Bachelor of Science in Computer Science
//   universityName: BUET
//   degreeTitle: B.Sc in Computer Science
//   graduationYear: 2021
//   presentAddress: 45 Gulshan Avenue, Apartment 10B
//   presentCity: Dhaka
//   presentCountry: Bangladesh
//   technicalSkills: ["React.js","JavaScript","TypeScript","HTML/CSS","Redux","Git"]
//   softSkills: ["Communication","Problem Solving","Team Collaboration","Attention to Detail"]
//   coverLetter: I am very interested in the Frontend Developer position at Digital Innovation Labs. With 3 years of professional experience in React.js development and a passion for creating beautiful, user-friendly interfaces, I believe I would be a great fit for your team. I have successfully delivered multiple responsive web applications and have strong experience with modern JavaScript frameworks.
//   certifications: ["React Fundamentals Certified"]
//   languages: [{"name":"English","proficiency":"Fluent"},{"name":"Bengali","proficiency":"Native"}]
//   whyHireYou: I bring 3 years of solid React experience, strong problem-solving skills, and a proven track record of delivering high-quality frontend solutions. I am a quick learner and passionate about staying updated with the latest web technologies.
//   preferredEmploymentType: Full Time
//   noticePeriod: 2 weeks

// /**
//  * RESPONSE: You'll get the Application ID
//  * {
//  *   "_id": "COPY_THIS_APPLICATION_ID_FOR_NEXT_STEP"
//  * }
//  */

// // ============================================================

// /**
//  * STEP 3: VIEW ALL APPLICANTS FOR THE JOB
//  * GET http://localhost:5000/api/job-applications/job/[PASTE_JOB_ID_FROM_STEP_1_HERE]
//  * 
//  * This endpoint returns all candidates who applied with their details
//  * Perfect for HR to review all applicants at once!
//  */

// // Expected Response Structure:
// {
//   "success": true,
//   "statusCode": 200,
//   "message": "Applications fetched successfully",
//   "data": [
//     {
//       "_id": "APPLICATION_ID",
//       "jobId": {
//         "_id": "JOB_ID",
//         "title": "Frontend Developer",
//         "companyName": "Digital Innovation Labs",
//         "jobType": "Full Time",
//         "location": "Dhaka"
//       },
//       "firstName": "Ahmed",
//       "lastName": "Khan",
//       "email": "ahmed.khan@example.com",
//       "phoneNumber": "01798765432",
//       "currentPosition": "Junior Frontend Developer",
//       "yearsOfExperience": 3,
//       "academicQualification": "Bachelor of Science in Computer Science",
//       "universityName": "BUET",
//       "presentCity": "Dhaka",
//       "presentCountry": "Bangladesh",
//       "technicalSkills": ["React.js", "JavaScript", "TypeScript"],
//       "softSkills": ["Communication", "Problem Solving"],
//       "linkedinProfile": "https://linkedin.com/in/ahmadkhan",
//       "portfolioUrl": "https://ahmadkhan-portfolio.netlify.app",
//       "resumeUrl": "http://localhost:5000/uploads/job-applications/user123_1700129400000.pdf",
//       "applicationStatus": "Pending",
//       "appliedAt": "2024-11-16T14:30:00Z"
//     }
//   ]
// }

// // ============================================================

// /**
//  * STEP 4: UPDATE APPLICATION STATUS
//  * PATCH http://localhost:5000/api/job-applications/[PASTE_APPLICATION_ID_FROM_STEP_2_HERE]/status
//  * 
//  * Use this when you want to shortlist, reject, or interview a candidate
//  */
// {
//   "applicationStatus": "Shortlisted"
// }

// // Status Options:
// // - "Pending" (initial status)
// // - "Reviewed" (reviewed the application)
// // - "Shortlisted" (candidate moves to next round)
// // - "Interview Scheduled" (interview scheduled)
// // - "Selected" (job offered)
// // - "Rejected" (rejected candidate)

// // ============================================================

// /**
//  * STEP 5: ADD INTERNAL NOTES FOR HR
//  * PATCH http://localhost:5000/api/job-applications/[PASTE_APPLICATION_ID_HERE]/notes
//  * 
//  * Use this to communicate internally about candidates
//  */
// {
//   "internalNotes": "Excellent React skills demonstrated in portfolio. Recommended for technical round. Follow up with HR for interview scheduling."
// }

// // ============================================================

// /**
//  * STEP 6: GET APPLICATION STATISTICS
//  * GET http://localhost:5000/api/job-applications/job/[PASTE_JOB_ID_HERE]/count-by-status
//  * 
//  * Perfect for dashboard/analytics!
//  */

// // Response shows how many candidates are in each status:
// {
//   "success": true,
//   "statusCode": 200,
//   "message": "Application count by status fetched successfully",
//   "data": [
//     {"_id": "Pending", "count": 15},
//     {"_id": "Reviewed", "count": 8},
//     {"_id": "Shortlisted", "count": 5},
//     {"_id": "Interview Scheduled", "count": 2},
//     {"_id": "Selected", "count": 1},
//     {"_id": "Rejected", "count": 3}
//   ]
// }

// // ============================================================

// /**
//  * ADDITIONAL USEFUL ENDPOINTS
//  */

// /**
//  * Search Applications with Filters
//  * GET http://localhost:5000/api/job-applications/search?jobId=JOB_ID&applicationStatus=Shortlisted
//  */

// /**
//  * Get Applications by Candidate Email
//  * GET http://localhost:5000/api/job-applications/email/ahmed.khan@example.com
//  */

// /**
//  * Get Single Application Details
//  * GET http://localhost:5000/api/job-applications/[APPLICATION_ID]
//  */

// /**
//  * Delete Application
//  * DELETE http://localhost:5000/api/job-applications/[APPLICATION_ID]
//  */

// /**
//  * Get Jobs Count by Category (Analytics)
//  * GET http://localhost:5000/api/jobs/analytics/count-by-category
//  */

// /**
//  * Get Total Active Jobs Count
//  * GET http://localhost:5000/api/jobs/analytics/total-count
//  */

// // ============================================================
// // PROFESSIONAL JOB POSTING EXAMPLES
// // ============================================================

// /**
//  * Example 2: Senior Backend Developer Job
//  * POST http://localhost:5000/api/jobs
//  */
// {
//   "title": "Senior Backend Developer (Node.js)",
//   "slug": "senior-backend-developer-nodejs-2024",
//   "description": "Join our growing backend team as a Senior Node.js Developer. We're building scalable APIs and microservices for millions of users. You'll work with cutting-edge technologies and mentor junior developers.",
//   "companyName": "Cloud Solutions Inc",
//   "companyLogoUrl": "https://example.com/logo.png",
//   "companyWebsite": "https://cloudsolutions.com",
//   "jobType": "Full Time",
//   "experience": "5-8 years",
//   "salaryCurrency": "BDT",
//   "salaryMin": 2500000,
//   "salaryMax": 4000000,
//   "salaryShowInListing": true,
//   "salaryRange": "25,00,000 - 40,00,000 BDT",
//   "category": "Engineering",
//   "specialization": "Backend Development",
//   "location": "Dhaka",
//   "locationType": "Remote",
//   "countries": ["Bangladesh", "Global"],
//   "vacancies": 2,
//   "qualifications": [
//     "Bachelor's Degree in Computer Science or related field",
//     "5+ years of professional backend development experience",
//     "Strong experience with Node.js and Express",
//     "Experience with relational and NoSQL databases"
//   ],
//   "requiredSkills": [
//     "Node.js",
//     "Express.js",
//     "MongoDB",
//     "PostgreSQL",
//     "RESTful APIs",
//     "Docker"
//   ],
//   "preferredSkills": [
//     "Microservices Architecture",
//     "Kubernetes",
//     "AWS",
//     "GraphQL",
//     "RabbitMQ or Kafka",
//     "Redis"
//   ],
//   "responsibilities": [
//     "Design and build scalable backend systems",
//     "Optimize database queries and API performance",
//     "Implement security best practices",
//     "Mentor junior developers",
//     "Participate in architectural decisions"
//   ],
//   "benefits": [
//     "Highly Competitive Salary",
//     "Stock Options",
//     "Premium Health Insurance",
//     "Unlimited PTO",
//     "Home Office Setup",
//     "Learning Budget"
//   ],
//   "applicationDeadline": "2024-12-31T23:59:59Z",
//   "duration": "Full-time, Permanent",
//   "aboutCompany": "Cloud Solutions Inc is a leading provider of cloud infrastructure and development services serving Fortune 500 companies.",
//   "certificationsRequired": [],
//   "languages": [
//     {"name": "English", "level": "Fluent"}
//   ],
//   "isActive": true,
//   "isFeatured": true,
//   "tags": ["nodejs", "backend", "microservices", "remote"]
// }

// /**
//  * Example 3: UI/UX Designer Job
//  * POST http://localhost:5000/api/jobs
//  */
// {
//   "title": "UX/UI Designer",
//   "slug": "uxui-designer-2024",
//   "description": "We are seeking a creative UX/UI Designer to create beautiful and intuitive user experiences for our mobile and web applications.",
//   "companyName": "Creative Minds Design Studio",
//   "companyLogoUrl": "https://example.com/logo.png",
//   "companyWebsite": "https://creativeminds.com",
//   "jobType": "Full Time",
//   "experience": "2-3 years",
//   "salaryCurrency": "BDT",
//   "salaryMin": 900000,
//   "salaryMax": 1400000,
//   "salaryShowInListing": true,
//   "category": "Design",
//   "specialization": "UX/UI Design",
//   "location": "Dhaka",
//   "locationType": "On-Site",
//   "countries": ["Bangladesh"],
//   "vacancies": 1,
//   "qualifications": [
//     "Bachelor's Degree in Design or related field",
//     "2-3 years of UX/UI design experience",
//     "Portfolio showcasing your work"
//   ],
//   "requiredSkills": [
//     "Figma",
//     "Adobe XD",
//     "Wireframing",
//     "Prototyping",
//     "User Research"
//   ],
//   "preferredSkills": [
//     "UI Animation",
//     "Interaction Design",
//     "Design Systems",
//     "Usability Testing"
//   ],
//   "responsibilities": [
//     "Design intuitive user interfaces",
//     "Conduct user research and testing",
//     "Create wireframes and prototypes",
//     "Collaborate with developers",
//     "Maintain design consistency"
//   ],
//   "benefits": [
//     "Competitive Salary",
//     "Creative Work Environment",
//     "Professional Development",
//     "Flexible Hours"
//   ],
//   "applicationDeadline": "2024-12-31T23:59:59Z",
//   "duration": "Full-time, Permanent",
//   "aboutCompany": "Creative Minds Design Studio is a boutique design agency working with innovative tech companies.",
//   "isActive": true,
//   "isFeatured": false,
//   "tags": ["design", "uxui", "figma", "creative"]
// }

// // ============================================================
// // ERROR RESPONSES (Examples of what to expect)
// // ============================================================

// /**
//  * Error: Missing Required File
//  * Status: 400
//  */
// {
//   "success": false,
//   "statusCode": 400,
//   "message": "Resume file is required",
//   "data": null
// }

// /**
//  * Error: Invalid File Type
//  * Status: 400
//  */
// {
//   "success": false,
//   "statusCode": 400,
//   "message": "Invalid file type. Only PDF, DOC, and DOCX files are allowed. Received: image/jpeg",
//   "data": null
// }

// /**
//  * Error: File Too Large
//  * Status: 413
//  */
// {
//   "success": false,
//   "statusCode": 413,
//   "message": "File size exceeds 5MB limit",
//   "data": null
// }

// /**
//  * Error: Job Not Found
//  * Status: 404
//  */
// {
//   "success": false,
//   "statusCode": 404,
//   "message": "Job not found",
//   "data": null
// }

// // ============================================================
// // TESTING CHECKLIST
// // ============================================================

// /*
// ✅ Testing Steps:

// 1. CREATE JOB
//    - Copy Example 1 or 2 from above
//    - POST to http://localhost:5000/api/jobs
//    - ✓ Save the returned _id

// 2. GET ALL JOBS
//    - GET http://localhost:5000/api/jobs
//    - ✓ Should see your created job

// 3. GET FEATURED JOBS
//    - GET http://localhost:5000/api/jobs/featured/list
//    - ✓ Should see featured jobs

// 4. APPLY FOR JOB (with resume)
//    - POST http://localhost:5000/api/job-applications/apply
//    - ✓ Upload a real PDF/DOC resume
//    - ✓ Save the returned application _id

// 5. VIEW ALL APPLICANTS
//    - GET http://localhost:5000/api/job-applications/job/[JOB_ID]
//    - ✓ Should see your application with all details

// 6. UPDATE APPLICATION STATUS
//    - PATCH http://localhost:5000/api/job-applications/[APP_ID]/status
//    - ✓ Change status to "Shortlisted"

// 7. ADD NOTES
//    - PATCH http://localhost:5000/api/job-applications/[APP_ID]/notes
//    - ✓ Add some internal notes

// 8. VIEW APPLICATION STATISTICS
//    - GET http://localhost:5000/api/job-applications/job/[JOB_ID]/count-by-status
//    - ✓ Should see status breakdown

// All endpoints tested and working! ✅
// */

// export default {
//   jobExample: "Example job posting",
//   applicationExample: "Example application"
// };
