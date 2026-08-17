"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSixMonthCheckIn = exports.sendAdminDigest = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../../../config"));
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SCHEDULED EMAIL TEMPLATES
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Two emails, both plain and both short.
 *
 * The digest goes to staff and exists to replace someone remembering to check a
 * page. The check-in goes to a candidate six months after they joined, and its
 * whole job is to get one click back - so it asks exactly one question and puts
 * the answer buttons above the fold.
 */
const transporter = () => nodemailer_1.default.createTransport({
    host: config_1.default.email_host,
    port: Number(config_1.default.email_port),
    secure: false,
    auth: { user: config_1.default.email_user, pass: config_1.default.email_pass },
});
const shell = (title, body) => `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#1f2937">
    <div style="background:#1F4E79;padding:20px 24px;border-radius:12px 12px 0 0">
      <h1 style="margin:0;color:#fff;font-size:18px">CADD CORE Job Portal</h1>
      <p style="margin:4px 0 0;color:#b9d4ee;font-size:13px">${title}</p>
    </div>
    <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:24px">
      ${body}
    </div>
  </div>
`;
const listBlock = (heading, color, items) => {
    if (items.length === 0)
        return '';
    return `
    <div style="margin-bottom:20px">
      <p style="margin:0 0 8px;font-weight:600;color:${color}">${heading}</p>
      <ul style="margin:0;padding-left:18px;color:#374151;font-size:14px;line-height:1.7">
        ${items.map((item) => `<li>${item}</li>`).join('')}
      </ul>
    </div>
  `;
};
const sendAdminDigest = async (recipients, payload) => {
    if (recipients.length === 0)
        return;
    const body = `
    <p style="margin:0 0 20px;font-size:14px">
      Here is what needs attention on the placement side today.
    </p>
    ${listBlock('Six-month check-ins due', '#1d4ed8', payload.dueCheckIns)}
    ${listBlock('Hires with no joining date (not counted as Placed)', '#b45309', payload.missingJoiningDates)}
    ${listBlock('Employer follow-up actions past their date', '#be123c', payload.overdueEmployerActions)}
    <a href="${config_1.default.client_url}/admin/hired"
       style="display:inline-block;background:#1F4E79;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600">
      Open the placement dashboard
    </a>
    <p style="margin:20px 0 0;font-size:12px;color:#6b7280">
      You are getting this because the daily placement digest is switched on in
      Admin → Settings → Automated Emails.
    </p>
  `;
    // One message with everyone on BCC rather than a send per recipient: it is a
    // single SMTP round trip, and staff do not need to see each other's addresses.
    await transporter().sendMail({
        from: config_1.default.email_from,
        to: config_1.default.email_from,
        bcc: recipients,
        subject: `Placement digest - ${payload.dueCheckIns.length} check-in(s), ${payload.missingJoiningDates.length} missing date(s)`,
        html: shell('Daily placement digest', body),
    });
};
exports.sendAdminDigest = sendAdminDigest;
const sendSixMonthCheckIn = async (email, payload) => {
    const body = `
    <p style="margin:0 0 16px;font-size:15px">Hi ${payload.candidateName},</p>
    <p style="margin:0 0 20px;font-size:14px;line-height:1.7">
      It has been about six months since you joined
      <strong>${payload.companyName}</strong> as
      <strong>${payload.jobTitle}</strong>. We keep track of how our graduates
      are doing, and it takes one click to tell us.
    </p>
    <p style="margin:0 0 12px;font-size:14px;font-weight:600">
      Are you still working there?
    </p>
    <div style="margin-bottom:24px">
      <a href="${payload.checkInUrl}&answer=working"
         style="display:inline-block;background:#059669;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:14px;font-weight:600;margin-right:8px">
        Yes, still working
      </a>
      <a href="${payload.checkInUrl}&answer=left"
         style="display:inline-block;background:#fff;color:#374151;text-decoration:none;padding:11px 21px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;font-weight:600">
        No, I have left
      </a>
    </div>
    <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6">
      Either button opens a short page where you can add detail if you want to.
      This link works for ${payload.expiresInDays} days. If neither answer fits,
      just reply to this email.
    </p>
  `;
    await transporter().sendMail({
        from: config_1.default.email_from,
        to: email,
        subject: `Quick question - are you still at ${payload.companyName}?`,
        html: shell('Six-month check-in', body),
    });
};
exports.sendSixMonthCheckIn = sendSixMonthCheckIn;
//# sourceMappingURL=cron.emails.js.map