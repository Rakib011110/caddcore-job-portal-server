import { Types } from 'mongoose';

export type TJobs = {
  _id?: string;
  
  // Basic Information
  title: string;
  slug: string;
  description: string;
  companyName: string;
  companyLogoUrl?: string;
  companyWebsite?: string;
  
  // Company Reference (for company-posted jobs)
  company?: Types.ObjectId;
  
  // Posted By (User who posted this job)
  postedBy?: Types.ObjectId;
  
  // Job Details
  jobType: "Full Time" | "Part Time" | "Contract" | "Temporary" | "Internship" | "Freelance";
  experience: string; // e.g., "2-5 years", "Entry Level", "5+ years"
  salaryCurrency: string; // e.g., "BDT", "USD"
  salaryMin?: number;
  salaryMax?: number;
  salaryShowInListing?: boolean;
  salaryRange?: string; // e.g., "1,00,000 - 2,50,000 BDT"
  
  // Job Structure
  category: string; // e.g., "Engineering", "Design", "Marketing"
  categoryRef?: Types.ObjectId; // Reference to Category collection
  subcategory?: string; // e.g., "Web Development", "UI/UX Design"
  subcategoryRef?: Types.ObjectId; // Reference to Category (subcategory)
  specialization?: string; // e.g., "Full Stack Developer", "UI/UX Designer"
  
  // Location
  location: string;
  locationType: "On-Site" | "Remote" | "Hybrid";
  countries?: string[];
  
  // Job Requirements
  vacancies: number;
  qualifications: string[]; // e.g., ["Bachelor's Degree", "Master's Degree"]
  requiredSkills: string[];
  preferredSkills?: string[];
  
  // Responsibilities
  responsibilities: string[];
  
  // Benefits
  benefits: string[]; // e.g., ["Health Insurance", "Paid Leave", "Training"]
  
  // Time Information
  datePosted: Date;
  applicationDeadline?: Date;
  duration?: string; // For internships/contracts
  
  // Additional Details
  aboutCompany?: string;
  certificationsRequired?: string[];
  languages?: Array<{ name: string; level: string }>; // e.g., [{name: "English", level: "Fluent"}]
  
  // Status
  isActive: boolean;
  isFeatured?: boolean;
  
  // SEO & Metadata
  tags?: string[];
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
};
