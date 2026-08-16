import { JwtPayload } from 'jsonwebtoken';
import { IApplicationScope } from '../modules/jobs/Jobaplications/application.access';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & {
        id: string;
        email: string;
        role: string;
      };
      /**
       * Who is reading job applications, resolved once by the access guards in
       * `application.access.ts` so controllers never re-derive it.
       */
      applicationScope?: IApplicationScope;
    }
  }
}
