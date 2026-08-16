/**
 * `PATCH /:id/make-base-member` used to live here. It belonged to the BASE
 * membership system, which is a different CADD CORE product — this portal has
 * no /base-member module, no application flow, and no client screen that ever
 * called it. All it did was write a string into `membershipId`.
 *
 * `membershipId` itself stays on the model: the admin All Users screen still
 * shows, edits and CSV-exports it, and it saves through `PUT /:id` like every
 * other profile field.
 */
export declare const UserRoutes: import("express-serve-static-core").Router;
//# sourceMappingURL=user.routes.d.ts.map