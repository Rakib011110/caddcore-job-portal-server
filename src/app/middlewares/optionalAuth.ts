import { NextFunction, Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import config from '../../config';
import { verifyToken } from '../utils/verifyJWT';

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
export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  let token = req.headers.authorization;

  if (!token) return next();
  if (token.startsWith('Bearer ')) token = token.slice(7);
  if (!token || token.length < 10) return next();

  try {
    const decoded = verifyToken(
      token,
      config.jwt_access_secret as string
    ) as JwtPayload;

    (req as any).user = decoded;
  } catch {
    // A bad token is treated as no token. The handler is responsible for
    // refusing the request if it needs an authenticated caller.
  }

  next();
};

export default optionalAuth;
