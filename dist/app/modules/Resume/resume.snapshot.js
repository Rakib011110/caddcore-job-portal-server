"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSnapshotStale = exports.buildResumeSnapshot = void 0;
const resume_templates_1 = require("./resume.templates");
/** Content fields copied verbatim into the snapshot. */
const SNAPSHOT_CONTENT_FIELDS = [
    'fullName',
    'email',
    'phone',
    'address',
    'city',
    'country',
    'profilePhoto',
    'headline',
    'summary',
    'currentJobTitle',
    'totalExperienceYears',
    'expectedSalary',
    'education',
    'workExperience',
    'skills',
    'certifications',
    'languages',
    'projects',
    'awards',
    'references',
    'socialLinks',
    'fileUrl',
];
/**
 * Deep-copy the reviewed content off a resume document.
 *
 * `toObject()` is deliberate: without it the arrays would still be live
 * Mongoose subdocuments sharing memory with the resume, and a later edit could
 * mutate the "immutable" snapshot from underneath us.
 */
const buildResumeSnapshot = (resume) => {
    const doc = resume.toObject({ depopulate: true });
    // While a CV carries edits nobody has reviewed, the approved copy is what an
    // employer receives - not the live draft sitting on top of it. This is the
    // single line that keeps "unreviewed content never reaches an employer" true
    // even though the candidate stays free to keep applying.
    const usingApprovedCopy = Boolean(doc.pendingReapproval && doc.approvedContent);
    const plain = usingApprovedCopy
        ? { ...doc, ...doc.approvedContent }
        : doc;
    const snapshot = {
        resumeId: String(resume._id),
        version: usingApprovedCopy
            ? (doc.approvedVersion ?? resume.version ?? 1)
            : (resume.version ?? 1),
        template: (0, resume_templates_1.isKnownTemplate)(plain.template)
            ? plain.template
            : resume_templates_1.DEFAULT_RESUME_TEMPLATE_ID,
        title: plain.title,
        approvedAt: plain.reviewedAt,
        capturedAt: new Date(),
        ...(Array.isArray(plain.sectionOrder)
            ? { sectionOrder: [...plain.sectionOrder] }
            : {}),
    };
    SNAPSHOT_CONTENT_FIELDS.forEach((field) => {
        const value = plain[field];
        if (value !== undefined && value !== null) {
            snapshot[field] = value;
        }
    });
    return snapshot;
};
exports.buildResumeSnapshot = buildResumeSnapshot;
/**
 * Has the candidate's live resume moved on since this snapshot was taken?
 *
 * Recruiters see this as "the candidate has updated their CV since applying",
 * which is useful context without implying anything is wrong.
 */
const isSnapshotStale = (snapshot, resume) => {
    if (!snapshot || !resume)
        return false;
    return (resume.version ?? 1) !== snapshot.version;
};
exports.isSnapshotStale = isSnapshotStale;
//# sourceMappingURL=resume.snapshot.js.map