
export type Country = 'UK' | 'Canada' | 'Australia' | 'New Zealand' | 'USA' | 'Japan' | 'Singapore';
export type Branch = 'Colombo HQ' | 'Kandy' | 'Galle' | 'Jaffna';

// Updated Pipeline as per request
export type StudentStatus = 
  | 'New Inquiry' 
  | 'Counseling' 
  | 'Documentation' 
  | 'Uni Application' 
  | 'Offer Received' 
  | 'Visa Pilot';

export type Priority = 'High' | 'Medium' | 'Low';
export type TaskStatus = 'Pending' | 'In Progress' | 'In Review' | 'Completed' | 'Overdue';

// New Role System
export type UserRole = 'Student' | 'Counselor' | 'Manager' | 'Team Lead' | 'Admin';

export interface Employee {
  id: string;
  name: string;
  role: string;
  branch: string;
  email: string;
  specialty?: string;
  avatar?: string;
  // New: Availability configuration
  availability?: {
    days: number[]; // 0=Sun, 1=Mon...
    startHour: number; // 9 for 9AM
    endHour: number; // 17 for 5PM
  };
  // New: Business Metrics
  targets?: {
      monthlyIntake: number;
      monthlyRevenue: number;
  };
  npsScore?: number; // Net Promoter Score (0-100)
}

export interface DocumentFile {
  id: string;
  name: string;
  type: 'Passport' | 'Transcript' | 'Financial' | 'SOP' | 'OfferLetter' | 'Identity' | 'EnglishProficiency' | 'WorkExperience' | 'GTE' | 'OSHC' | 'PoliceClearance' | 'TBTest' | 'UpfrontMedicals' | 'COE' | 'Portfolio' | 'ReferenceLetter';
  status: 'Pending' | 'Reviewing' | 'Verified' | 'Rejected';
  url?: string;
  uploadedAt: string;
  rejectionReason?: string; // Workflow: Reason for rejection
  // New: Tiered Engine
  tier?: 'Global' | 'Country' | 'University';
  phase?: 1 | 2 | 3;
}

export type AssetType = 'Savings' | 'Fixed Deposit' | 'Property' | 'Business Income' | 'Sponsor Support';

export interface FinancialAsset {
  id: string;
  type: AssetType;
  amountLKR: number;
  bankName?: string;
  maturityDate?: string; // For FDs
  fundsAgeMonths: number; // Critical for UK/Aus
  isLiquid: boolean;
}

export type InvoiceStatus = 'Pending' | 'Verifying' | 'Paid' | 'Overdue' | 'Cancelled';

export interface Invoice {
  id: string;
  studentId: string;
  amount: number;
  currency: string;
  description: string; // e.g., "Registration Fee"
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  paymentMethod?: 'Bank Transfer' | 'Online Card' | 'Cash';
  paymentProofUrl?: string; // For bank transfer uploads
  generatedReceiptUrl?: string; // Mock URL after payment
}

export type AppointmentStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'No Show';

export interface Appointment {
  id: string;
  counselorId: string;
  studentId: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // minutes
  type: 'Counseling' | 'Visa Check' | 'Mock Interview';
  status: AppointmentStatus;
  meetingLink?: string;
  outcomeNotes?: string;
}

export interface Student {
  id: string;
  name: string;
  country: Country;
  status: StudentStatus;
  counselor: string; // Employee ID
  branch: Branch;
  gpa: string;
  ielts: string;
  notes: string;
  // New Fields
  email?: string;
  phone?: string;
  budget?: string; // Annual Budget in USD
  priority?: Priority;
  lastEducationDate?: string; 
  documents?: DocumentFile[];
  
  // Financial Calculator Props
  financials?: {
    tuitionFee: number; // In Target Currency
    scholarship: number;
    paidTuition: number;
    assets: FinancialAsset[];
  };

  // New: Intelligent Engine Fields
  targetUniversity?: string;
  applicationId?: string;
  visa?: {
    [key: string]: 'Pending' | 'In Progress' | 'Completed' | 'Rejected';
  };
  visaHistory?: {
    country: Country;
    milestones: { [key: string]: 'Pending' | 'In Progress' | 'Completed' | 'Rejected' };
    archivedAt: string;
  }[];
  generatedCV?: {
    name: string;
    role: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    experience: any[];
    education: any[];
    skills: string[];
    profilePicture: string | null;
    customSections: any[];
    updatedAt: string;
  };
  slaViolations?: {
    id: string;
    stage: string;
    missingItems: string[];
    timestamp: string;
    resolved: boolean;
  }[];
}

export interface Task {
  id?: string; 
  task: string;
  assigned_to: string[]; // Changed to array for multi-select
  student_id: string;
  priority: Priority;
  status: TaskStatus;
  dueDate?: string;
  // New: Intelligent Engine Classification
  tier?: 'Global' | 'Country' | 'University'; 
  phase?: 1 | 2 | 3; 
  isBlocking?: boolean; 
  documentType?: DocumentFile['type']; // For auto-resolution
  isPrivate?: boolean; // New: Personal tasks
}

export interface UniversityRule {
  name: string;
  country: Country;
  minGPA: number;
  minIELTS: number;
  ranking: number;
  requiredDocs?: string[]; // e.g. ['Portfolio', 'Reference Letter']
}

// New Interface for Knowledge Base
export interface UniversityProgram {
  id: string;
  university: string;
  programName: string;
  country: Country;
  tuition: number; // In USD for normalization or Local Currency
  currency: string;
  duration: string;
  intake: string;
  minGPA: number;
  minIELTS: number;
  ranking: number;
  tags: string[];
  logoColor: string; // For UI placeholder
}

export interface ActivityLog {
  id: string;
  user: string; // Name of user who performed action
  role: UserRole;
  action: string;
  target: string; // e.g. "Passport.pdf" or "Aruni Perera"
  timestamp: string;
  type: 'upload' | 'approval' | 'rejection' | 'task' | 'system' | 'finance' | 'calendar'; // Added calendar type
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string; // ISO string
  read: boolean;
  platform: 'portal' | 'whatsapp';
}
