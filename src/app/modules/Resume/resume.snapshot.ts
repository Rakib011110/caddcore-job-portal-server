import { IResumeContent, IResumeDocument } from './resume.interface';
import { DEFAULT_RESUME_TEMPLATE_ID, isKnownTemplate } from './resume.templates';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * RESUME SNAPSHOT
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * A resume document is mutable: the candidate keeps editing it, and any edit to
 * reviewed content drops it back to `draft` so it has to be approved again.
 * That is right for the living CV - and wrong for an application that was
 * already sent.
 *
 * Storing only `resumeId` on an application meant a recruiter opening it later
 * would see whatever the candidate has typed since, labelled with the version
 * number of something else entirely. So at apply time we copy the approved
 * content onto the application and never touch it again.
 *
 * The snapshot is the record of what was approved. The resume document is the
 * candidate's current draft. They are allowed to diverge, and the UI says so.
 */

export interface IResumeSnapshot extends IResumeContent {
  /** The resume this was copied from - for tracing, not for reading content */
  resumeId: string;
  /** Submission number that was approved */
  version: number;
  /** Template the content was approved in */
  template: string;
  /** Section order approved alongside it, for the `custom` template */
  sectionOrder?: string[];
  /** Candidate-facing resume label at the time of applying */
  title?: string;
  approvedAt?: Date;
  /** When the copy was taken (i.e. when the candidate applied) */
  capturedAt: Date;
}

/** Content fields copied verbatim into the snapshot. */
const SNAPSHOT_CONTENT_FIELDS: (keyof IResumeContent)[] = [
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
export const buildResumeSnapshot = (
  resume: IResumeDocument
): IResumeSnapshot => {
  const doc = resume.toObject({ depopulate: true }) as Record<string, any>;

  // While a CV carries edits nobody has reviewed, the approved copy is what an
  // employer receives - not the live draft sitting on top of it. This is the
  // single line that keeps "unreviewed content never reaches an employer" true
  // even though the candidate stays free to keep applying.
  const usingApprovedCopy = Boolean(doc.pendingReapproval && doc.approvedContent);
  const plain: Record<string, any> = usingApprovedCopy
    ? { ...doc, ...doc.approvedContent }
    : doc;

  const snapshot: IResumeSnapshot = {
    resumeId: String(resume._id),
    version: usingApprovedCopy
      ? (doc.approvedVersion ?? resume.version ?? 1)
      : (resume.version ?? 1),
    template: isKnownTemplate(plain.template)
      ? plain.template
      : DEFAULT_RESUME_TEMPLATE_ID,
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
      (snapshot as Record<string, any>)[field] = value;
    }
  });

  return snapshot;
};

/**
 * Has the candidate's live resume moved on since this snapshot was taken?
 *
 * Recruiters see this as "the candidate has updated their CV since applying",
 * which is useful context without implying anything is wrong.
 */
export const isSnapshotStale = (
  snapshot: Pick<IResumeSnapshot, 'version'> | undefined,
  resume: Pick<IResumeDocument, 'version'> | null | undefined
): boolean => {
  if (!snapshot || !resume) return false;
  return (resume.version ?? 1) !== snapshot.version;
};
