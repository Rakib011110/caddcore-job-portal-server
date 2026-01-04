import { Response } from 'express';
type TResponse<T> = {
    statusCode: number;
    success: boolean;
    message?: string;
    data: T;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
};
declare const sendResponse: <T>(res: Response, data: TResponse<T>) => void;
export default sendResponse;
//# sourceMappingURL=sendResponse.d.ts.map