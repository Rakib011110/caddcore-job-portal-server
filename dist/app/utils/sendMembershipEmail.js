"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendExaminerInterviewInvitationEmail = exports.sendReferenceRequestEmail = exports.sendMembershipInterviewUpdateEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../../config"));
const membershipEmailTemplates_1 = require("./membershipEmailTemplates");
const accessorEmailTemplate_1 = require("./accessorEmailTemplate");
// Create transporter using existing email configuration
const transporter = nodemailer_1.default.createTransport({
    host: config_1.default.email_host,
    port: Number(config_1.default.email_port),
    secure: false, // TLS
    auth: {
        user: config_1.default.email_user,
        pass: config_1.default.email_pass,
    },
});
// Verify SMTP connection
transporter.verify((err, success) => {
    if (err) {
        console.error('SMTP verification failed for membership emails:', err);
    }
    else {
        console.log('✅ SMTP ready for membership emails:', success);
    }
});
const sendMembershipInterviewUpdateEmail = async (email, userName, membershipType, applicationStatus, interviewDate, interviewTime, interviewVenue, adminNotes) => {
    const html = (0, membershipEmailTemplates_1.membershipInterviewUpdateTemplate)(userName, membershipType, applicationStatus, interviewDate, interviewTime, interviewVenue, adminNotes);
    console.log('Sending membership interview update email to:', email);
    try {
        const info = await transporter.sendMail({
            from: `"Base Membership" <${config_1.default.email_from}>`,
            to: email,
            subject: 'Base Membership  Update',
            html,
        });
        console.log('✅ Membership interview update email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    }
    catch (error) {
        console.error('❌ Error sending membership interview update email:', error);
        throw error;
    }
};
exports.sendMembershipInterviewUpdateEmail = sendMembershipInterviewUpdateEmail;
const sendReferenceRequestEmail = async (referenceMemberEmail, referenceMemberName, applicantName, applicantEmail, membershipType, loginUrl) => {
    const html = (0, membershipEmailTemplates_1.referenceRequestTemplate)(referenceMemberName, applicantName, applicantEmail, membershipType, loginUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`);
    console.log('📧 Sending reference request email...');
    console.log('To:', referenceMemberEmail);
    console.log('Reference Member:', referenceMemberName);
    console.log('Applicant:', applicantName);
    console.log('Membership Type:', membershipType);
    try {
        const info = await transporter.sendMail({
            from: `"BASE Membership Committee" <${config_1.default.email_from}>`,
            to: referenceMemberEmail,
            subject: `Reference Request: ${applicantName} - BASE Membership Application`,
            html,
        });
        console.log('✅ Reference request email sent successfully:', info.messageId);
        console.log('Email details:', {
            from: `"BASE Membership Committee" <${config_1.default.email_from}>`,
            to: referenceMemberEmail,
            subject: `Reference Request: ${applicantName} - BASE Membership Application`
        });
        return { success: true, messageId: info.messageId };
    }
    catch (error) {
        console.error('❌ Error sending reference request email:', error);
        console.error('Email config check:', {
            host: config_1.default.email_host,
            port: config_1.default.email_port,
            user: config_1.default.email_user ? '***configured***' : 'NOT SET',
            from: config_1.default.email_from
        });
        throw error;
    }
};
exports.sendReferenceRequestEmail = sendReferenceRequestEmail;
const sendExaminerInterviewInvitationEmail = async (examiners, interviewDate, interviewTime, interviewVenue) => {
    console.log('📧 Sending examiner interview invitation emails...');
    console.log('Examiners:', examiners.map(e => `${e.name} (${e.email})`).join(', '));
    const emailPromises = examiners.map(async (examiner) => {
        try {
            const html = (0, accessorEmailTemplate_1.examinerInterviewInvitationTemplate)(examiner.name, interviewDate, interviewTime, interviewVenue);
            const info = await transporter.sendMail({
                from: `"BASE Membership Committee" <${config_1.default.email_from}>`,
                to: examiner.email,
                subject: 'Interview Invitation – BASE Membership Evaluation',
                html,
            });
            console.log(`✅ Examiner invitation sent to ${examiner.name} (${examiner.email}):`, info.messageId);
            return { success: true, email: examiner.email, name: examiner.name, messageId: info.messageId };
        }
        catch (error) {
            console.error(`❌ Failed to send examiner invitation to ${examiner.name} (${examiner.email}):`, error);
            return { success: false, email: examiner.email, name: examiner.name, error };
        }
    });
    const results = await Promise.allSettled(emailPromises);
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    console.log(`✅ Examiner invitations: ${successCount}/${examiners.length} sent successfully`);
    return results;
};
exports.sendExaminerInterviewInvitationEmail = sendExaminerInterviewInvitationEmail;
exports.default = {
    sendMembershipInterviewUpdateEmail: exports.sendMembershipInterviewUpdateEmail,
    sendReferenceRequestEmail: exports.sendReferenceRequestEmail,
    sendExaminerInterviewInvitationEmail: exports.sendExaminerInterviewInvitationEmail,
};
//# sourceMappingURL=sendMembershipEmail.js.map