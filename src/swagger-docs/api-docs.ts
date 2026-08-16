/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SWAGGER API DOCUMENTATION - JOB PORTAL
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * This file contains OpenAPI (Swagger) documentation for the Job Portal API.
 * Visit http://localhost:5000/api-docs to see the interactive documentation.
 */

// ─────────────────────────────────────────────────────────────────────────────
// JOBS API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /jobs:
 *   get:
 *     summary: Get all jobs
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: jobType
 *         schema:
 *           type: string
 *           enum: [Full Time, Part Time, Contract, Internship, Remote]
 *         description: Filter by job type
 *     responses:
 *       200:
 *         description: List of jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Job'
 * 
 *   post:
 *     summary: Create a new job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobInput'
 *     responses:
 *       201:
 *         description: Job created successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /jobs/{id}:
 *   get:
 *     summary: Get job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job details
 *       404:
 *         description: Job not found
 * 
 *   put:
 *     summary: Update job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobInput'
 *     responses:
 *       200:
 *         description: Job updated
 *       404:
 *         description: Job not found
 * 
 *   delete:
 *     summary: Delete job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job deleted
 *       404:
 *         description: Job not found
 */

// ─────────────────────────────────────────────────────────────────────────────
// JOB APPLICATIONS API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /job-applications:
 *   get:
 *     summary: Get all applications (Admin/Company)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Reviewed, Shortlisted, Interview Scheduled, Interview Completed, Selected, Rejected]
 *         description: Filter by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of applications
 */

/**
 * @swagger
 * /job-applications/apply:
 *   post:
 *     summary: Apply for a job
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobId
 *               - userId
 *             properties:
 *               jobId:
 *                 type: string
 *                 description: ID of the job to apply for
 *               userId:
 *                 type: string
 *                 description: ID of the applicant
 *               coverLetter:
 *                 type: string
 *                 description: Optional cover letter
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *       400:
 *         description: Already applied or invalid data
 */

/**
 * @swagger
 * /job-applications/{id}/status:
 *   patch:
 *     summary: Update application status
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - applicationStatus
 *             properties:
 *               applicationStatus:
 *                 type: string
 *                 enum: [Pending, Reviewed, Shortlisted, Interview Scheduled, Interview Completed, Selected, Rejected, Withdrawn]
 *               notes:
 *                 type: string
 *                 description: Optional notes for the status change
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       404:
 *         description: Application not found
 */

/**
 * @swagger
 * /job-applications/{id}/timeline:
 *   get:
 *     summary: Get application timeline/history
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application with full status history
 */

// ─────────────────────────────────────────────────────────────────────────────
// COMPANIES API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /companies:
 *   get:
 *     summary: Get all companies
 *     tags: [Companies]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [approved, pending, rejected]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of companies
 */

/**
 * @swagger
 * /companies/approved:
 *   get:
 *     summary: Get approved companies only
 *     tags: [Companies]
 *     responses:
 *       200:
 *         description: List of approved companies
 */

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of notifications
 */

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 */

// ─────────────────────────────────────────────────────────────────────────────
// SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @swagger
 * components:
 *   schemas:
 *     Job:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         companyName:
 *           type: string
 *         location:
 *           type: string
 *         jobType:
 *           type: string
 *           enum: [Full Time, Part Time, Contract, Internship, Remote]
 *         salaryMin:
 *           type: number
 *         salaryMax:
 *           type: number
 *         category:
 *           type: string
 *         requiredSkills:
 *           type: array
 *           items:
 *             type: string
 *         isActive:
 *           type: boolean
 *         applicationDeadline:
 *           type: string
 *           format: date-time
 * 
 *     JobInput:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - companyName
 *         - location
 *         - jobType
 *         - category
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         companyName:
 *           type: string
 *         location:
 *           type: string
 *         jobType:
 *           type: string
 *         category:
 *           type: string
 *         salaryMin:
 *           type: number
 *         salaryMax:
 *           type: number
 *         requiredSkills:
 *           type: array
 *           items:
 *             type: string
 * 
 *     Application:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         jobId:
 *           type: string
 *         userId:
 *           type: string
 *         applicationStatus:
 *           type: string
 *         coverLetter:
 *           type: string
 *         appliedAt:
 *           type: string
 *           format: date-time
 */

export {};
