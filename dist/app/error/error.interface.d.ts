export type TErrorSources = {
    path: string | number;
    message: string;
}[];
export type TGenericErrorResponse = {
    statusCode: number;
    message: string;
    errorSources: TErrorSources;
};
//# sourceMappingURL=error.interface.d.ts.map