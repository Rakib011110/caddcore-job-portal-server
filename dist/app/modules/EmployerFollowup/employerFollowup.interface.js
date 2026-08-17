"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FOLLOWUP_OUTCOMES = exports.HIRING_NEEDS = exports.FOLLOWUP_PURPOSES = exports.CONTACT_METHODS = void 0;
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * EMPLOYER FOLLOW-UP INTERFACES
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * The placement cell's call log: every time someone from the institute contacts
 * an employer, what was asked, and what came back.
 *
 * This is the one part of the tracking sheet the portal had no home for. Jobs,
 * applications and companies all record what the EMPLOYER did on the platform;
 * nothing recorded what WE did off it. Without that, "we have 40 employers"
 * cannot be separated from "we have 40 employers anyone has actually spoken
 * to", and the KPI sheet needs exactly that distinction.
 *
 * A follow-up always points at a Company. `companyNameSnapshot` exists so a log
 * line still reads correctly if that company is later renamed or removed.
 */
exports.CONTACT_METHODS = [
    'Phone',
    'Email',
    'WhatsApp',
    'Visit',
    'Meeting',
    'LinkedIn',
    'Other',
];
exports.FOLLOWUP_PURPOSES = [
    'Initial Contact',
    'Vacancy Collection',
    'CV Submission',
    'Interview Coordination',
    'Placement Confirmation',
    'Relationship Building',
    'Feedback Collection',
    'Other',
];
exports.HIRING_NEEDS = [
    'Immediate',
    'Within 1 Month',
    'Within 3 Months',
    'Future',
    'None',
    'Unknown',
];
exports.FOLLOWUP_OUTCOMES = [
    'Positive',
    'Neutral',
    'Negative',
    'No Response',
    'Pending',
];
//# sourceMappingURL=employerFollowup.interface.js.map