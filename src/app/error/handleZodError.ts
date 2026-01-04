import { ZodError, ZodIssue } from 'zod';
import { TErrorSources, TGenericErrorResponse } from './error.interface';


const handleZodError = (err: ZodError): TGenericErrorResponse => {
  const errorSources: TErrorSources = err.issues.map((issue: ZodIssue) => {
    return {
      path: issue?.path[issue.path.length - 1] as string | number,
      message: issue.message,
    };
  }).filter((source): source is { path: string | number; message: string } => source.path !== undefined);

  const statusCode = 400;

  return {
    statusCode,
    message: 'Validation Error',
    errorSources,
  };
};

export default handleZodError;