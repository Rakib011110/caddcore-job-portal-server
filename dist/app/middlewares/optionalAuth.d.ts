import { NextFunction, Request, Response } from 'express';
/**
 * Attach `req.user` when a valid token is present, and carry on either way.
 *
 * For endpoints that serve two kinds of caller - a signed-in admin and an
 * unauthenticated machine holding a shared secret. `auth()` would reject the
 * machine before the handler could check its secret; this lets both reach the
 * handler, which then decides.
 *
 * It never rejects, so it grants nothing on its own. Any route using it MUST
 * still authorise inside the handler.
 */
export declare const optionalAuth: (req: Request, _res: Response, next: NextFunction) => void;
export default optionalAuth;
//# sourceMappingURL=optionalAuth.d.ts.map