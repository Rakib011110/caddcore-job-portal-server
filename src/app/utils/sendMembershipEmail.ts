import nodemailer from 'nodemailer';
import config from '../../config';
import { membershipInterviewUpdateTemplate, referenceRequestTemplate } from './membershipEmailTemplates';
import { examinerInterviewInvitationTemplate } from './accessorEmailTemplate';

// Create transporter using existing email configuration
const transporter = nodemailer.createTransport({
  host: config.email_host,
  port: Number(config.email_port),
  secure: false, // TLS
  auth: {
    user: config.email_user,
    pass: config.email_pass,
  },
});

// Verify SMTP connection
transporter.verify((err, success) => {
  if (err) {
    console.error('SMTP verification failed for membership emails:', err);
  } else {
    console.log('✅ SMTP ready for membership emails:', success);
  }
});

export const sendMembershipInterviewUpdateEmail = async (
  email: string,
  userName: string,
  membershipType: string,
  applicationStatus: string,
  interviewDate?: string,
  interviewTime?: string,
  interviewVenue?: string,
  adminNotes?: string
) => {
  const html = membershipInterviewUpdateTemplate(
    userName,
    membershipType,
    applicationStatus,
    interviewDate,
    interviewTime,
    interviewVenue,
    adminNotes
  );

  console.log('Sending membership interview update email to:', email);

  try {
    const info = await transporter.sendMail({
      from: `"Base Membership" <${config.email_from}>`,
      to: email,
      subject: 'Base Membership  Update',
      html,
    });

    console.log('✅ Membership interview update email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending membership interview update email:', error);
    throw error;
  }
};

export const sendReferenceRequestEmail = async (
  referenceMemberEmail: string,
  referenceMemberName: string,
  applicantName: string,
  applicantEmail: string,
  membershipType: string,
  loginUrl?: string
) => {
  const html = referenceRequestTemplate(
    referenceMemberName,
    applicantName,
    applicantEmail,
    membershipType,
    loginUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`
  );

  console.log('📧 Sending reference request email...');
  console.log('To:', referenceMemberEmail);
  console.log('Reference Member:', referenceMemberName);
  console.log('Applicant:', applicantName);
  console.log('Membership Type:', membershipType);

  try {
    const info = await transporter.sendMail({
      from: `"BASE Membership Committee" <${config.email_from}>`,
      to: referenceMemberEmail,
      subject: `Reference Request: ${applicantName} - BASE Membership Application`,
      html,
    });

    console.log('✅ Reference request email sent successfully:', info.messageId);
    console.log('Email details:', {
      from: `"BASE Membership Committee" <${config.email_from}>`,
      to: referenceMemberEmail,
      subject: `Reference Request: ${applicantName} - BASE Membership Application`
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending reference request email:', error);
    console.error('Email config check:', {
      host: config.email_host,
      port: config.email_port,
      user: config.email_user ? '***configured***' : 'NOT SET',
      from: config.email_from
    });
    throw error;
  }
};

export const sendExaminerInterviewInvitationEmail = async (
  examiners: Array<{ email: string; name: string }>,
  interviewDate: string,
  interviewTime?: string,
  interviewVenue?: string
) => {
  console.log('📧 Sending examiner interview invitation emails...');
  console.log('Examiners:', examiners.map(e => `${e.name} (${e.email})`).join(', '));

  const emailPromises = examiners.map(async (examiner) => {
    try {
      const html = examinerInterviewInvitationTemplate(
        examiner.name,
        interviewDate,
        interviewTime,
        interviewVenue
      );

      const info = await transporter.sendMail({
        from: `"BASE Membership Committee" <${config.email_from}>`,
        to: examiner.email,
        subject: 'Interview Invitation – BASE Membership Evaluation',
        html,
      });

      console.log(`✅ Examiner invitation sent to ${examiner.name} (${examiner.email}):`, info.messageId);
      return { success: true, email: examiner.email, name: examiner.name, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Failed to send examiner invitation to ${examiner.name} (${examiner.email}):`, error);
      return { success: false, email: examiner.email, name: examiner.name, error };
    }
  });

  const results = await Promise.allSettled(emailPromises);
  
  const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  console.log(`✅ Examiner invitations: ${successCount}/${examiners.length} sent successfully`);

  return results;
};

export default {
  sendMembershipInterviewUpdateEmail,
  sendReferenceRequestEmail,
  sendExaminerInterviewInvitationEmail,
};
