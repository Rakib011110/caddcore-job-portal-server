import { ISettingDefinition } from './settings.interface';
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SETTINGS REGISTRY
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * ADDING A NEW SETTING
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Add one entry to `SETTINGS_REGISTRY` below.
 * 2. Add its key to `SETTING_KEYS` so it can be referenced type-safely.
 * 3. Read it anywhere with `await SettingsService.get<boolean>(SETTING_KEYS.YOUR_KEY)`.
 *
 * That is the whole process. No model change, no migration, no new route.
 * Settings with no DB row automatically resolve to `defaultValue`, so a newly
 * added setting works on existing deployments without a backfill.
 *
 * KEY NAMING: `group.snake_case_name` - the group is the part before the first
 * dot and is what the resolved config object nests under:
 *
 *   {
 *     "resume":          { "approval_required": true },
 *     "job_application": { "approved_resume_required": true }
 *   }
 */
export declare const SETTING_KEYS: {
    readonly RESUME_APPROVAL_REQUIRED: "resume.approval_required";
    readonly RESUME_ALLOW_EDIT_WHILE_PENDING: "resume.allow_edit_while_pending";
    readonly RESUME_AUTO_APPROVE_ON_RESUBMIT: "resume.auto_approve_on_resubmit";
    readonly RESUME_REAPPROVAL_REQUIRED: "resume.reapproval_required";
    readonly RESUME_MAJOR_CHANGE_THRESHOLD: "resume.major_change_threshold";
    readonly JOB_APPLICATION_APPROVED_RESUME_REQUIRED: "job_application.approved_resume_required";
    readonly REGISTRATION_STUDENT_ID_REQUIRED: "registration.student_id_required";
};
export type TSettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];
export declare const SETTINGS_REGISTRY: ISettingDefinition[];
export declare const SETTINGS_REGISTRY_MAP: ReadonlyMap<string, ISettingDefinition>;
/** The part of the key before the first dot, e.g. `resume` */
export declare const getSettingGroup: (key: string) => string;
export declare const getSettingDefinition: (key: string) => ISettingDefinition | undefined;
//# sourceMappingURL=settings.constant.d.ts.map