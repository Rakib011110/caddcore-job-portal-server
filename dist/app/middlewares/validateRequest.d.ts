import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';
/**
 * Validation middleware using Zod schemas
 */
declare const validateRequest: (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export default validateRequest;
//# sourceMappingURL=validateRequest.d.ts.map