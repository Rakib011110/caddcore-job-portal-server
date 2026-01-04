"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handleZodError = (err) => {
    const errorSources = err.issues.map((issue) => {
        return {
            path: issue?.path[issue.path.length - 1],
            message: issue.message,
        };
    }).filter((source) => source.path !== undefined);
    const statusCode = 400;
    return {
        statusCode,
        message: 'Validation Error',
        errorSources,
    };
};
exports.default = handleZodError;
//# sourceMappingURL=handleZodError.js.map