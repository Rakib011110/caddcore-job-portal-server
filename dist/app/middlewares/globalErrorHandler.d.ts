import { NextFunction, Request, Response } from 'express';
declare const globalErrorHandler: (err: any, req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
export default globalErrorHandler;
//# sourceMappingURL=globalErrorHandler.d.ts.map