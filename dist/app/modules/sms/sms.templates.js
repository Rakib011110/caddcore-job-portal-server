"use strict";
// SMS Templates for BaseMember Interview Updates
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStatusSpecificSMS = exports.createShortMembershipInterviewSMS = exports.createMembershipInterviewSMS = void 0;
const createMembershipInterviewSMS = (userName, membershipType, applicationStatus, interviewDate, interviewTime, interviewVenue, adminNotes) => {
    // Get readable membership type
    const membershipTypeMap = {
        'SENIOR_FELLOW': 'Senior/Fellow',
        'MEMBER': 'Member',
        'ASSOCIATE_MEMBER': 'Associate Member'
    };
    const readableMembershipType = membershipTypeMap[membershipType] || membershipType;
    // Get readable status
    const statusMap = {
        'PENDING': 'Pending Review',
        'APPROVED': 'Approved',
        'REJECTED': 'Not Approved'
    };
    const readableStatus = statusMap[applicationStatus] || applicationStatus;
    // Base greeting
    let message = `Dear ${userName},\n\nYour ${readableMembershipType} application status: ${readableStatus}`;
    // Add interview date/time if provided
    if (interviewDate && interviewTime) {
        message += `\n\nInterview: ${interviewDate} at ${interviewTime}`;
    }
    else if (interviewDate) {
        message += `\n\nInterview Date: ${interviewDate}`;
    }
    // Add venue if provided
    if (interviewVenue) {
        message += `\nVenue: ${interviewVenue}`;
    }
    // Add admin notes if provided (keep it short for SMS)
    if (adminNotes && adminNotes.length < 100) {
        message += `\n\nNote: ${adminNotes}`;
    }
    // Professional closing
    message += `\n\nBest regards,\nBase Membership Team`;
    // Ensure SMS is not too long (SMS limit is usually 160-320 characters)
    if (message.length > 300) {
        // Truncate message if too long
        message = message.substring(0, 280) + '...\n\nBase Membership Team';
    }
    return message;
};
exports.createMembershipInterviewSMS = createMembershipInterviewSMS;
// Alternative shorter template for very long content
const createShortMembershipInterviewSMS = (userName, membershipType, applicationStatus, interviewDate) => {
    const statusMap = {
        'PENDING': 'Pending',
        'APPROVED': 'Approved',
        'REJECTED': 'Rejected'
    };
    const membershipTypeMap = {
        'SENIOR_FELLOW': 'Senior',
        'MEMBER': 'Member',
        'ASSOCIATE_MEMBER': 'Associate'
    };
    const status = statusMap[applicationStatus] || applicationStatus;
    const type = membershipTypeMap[membershipType] || membershipType;
    let message = `Dear ${userName}, your ${type} membership is ${status}.`;
    if (interviewDate) {
        message += ` Interview: ${interviewDate}.`;
    }
    message += ` Check email for details. -Base Membership`;
    return message;
};
exports.createShortMembershipInterviewSMS = createShortMembershipInterviewSMS;
// Template for specific status updates
const createStatusSpecificSMS = (userName, membershipType, applicationStatus, interviewDate, interviewTime, interviewVenue) => {
    const membershipTypeMap = {
        'SENIOR_FELLOW': 'Senior/Fellow',
        'MEMBER': 'Member',
        'ASSOCIATE_MEMBER': 'Associate Member'
    };
    const readableMembershipType = membershipTypeMap[membershipType] || membershipType;
    switch (applicationStatus) {
        case 'PENDING':
            return `Dear ${userName}, your ${readableMembershipType} application is under review. We'll notify you soon.\n\nBest regards,\nBase Membership Team`;
        case 'APPROVED':
            let approvedMsg = `Congratulations ${userName}! Your ${readableMembershipType} application is APPROVED.`;
            if (interviewDate && interviewTime) {
                approvedMsg += `\n\nInterview: ${interviewDate} at ${interviewTime}`;
            }
            else if (interviewDate) {
                approvedMsg += `\n\nInterview: ${interviewDate}`;
            }
            if (interviewVenue) {
                approvedMsg += `\nVenue: ${interviewVenue}`;
            }
            approvedMsg += `\n\Welcome to Base Membership! Please check your email for more details`;
            return approvedMsg;
        case 'REJECTED':
            return `Dear ${userName}, your ${readableMembershipType} application was not approved. You may reapply in the future.\n\nBest regards,\nBase Membership Team`;
        default:
            return (0, exports.createMembershipInterviewSMS)(userName, membershipType, applicationStatus, interviewDate, interviewTime, interviewVenue);
    }
};
exports.createStatusSpecificSMS = createStatusSpecificSMS;
exports.default = {
    createMembershipInterviewSMS: exports.createMembershipInterviewSMS,
    createShortMembershipInterviewSMS: exports.createShortMembershipInterviewSMS,
    createStatusSpecificSMS: exports.createStatusSpecificSMS
};
//# sourceMappingURL=sms.templates.js.map