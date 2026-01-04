import mongoose from 'mongoose';
import { TGenericErrorResponse } from './error.interface';
declare const handleValidationError: (err: mongoose.Error.ValidationError) => TGenericErrorResponse;
export default handleValidationError;
//# sourceMappingURL=handleValidationError.d.ts.map