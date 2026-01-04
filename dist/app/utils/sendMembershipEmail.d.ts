export declare const sendMembershipInterviewUpdateEmail: (email: string, userName: string, membershipType: string, applicationStatus: string, interviewDate?: string, interviewTime?: string, interviewVenue?: string, adminNotes?: string) => Promise<{
    success: boolean;
    messageId: string;
}>;
export declare const sendReferenceRequestEmail: (referenceMemberEmail: string, referenceMemberName: string, applicantName: string, applicantEmail: string, membershipType: string, loginUrl?: string) => Promise<{
    success: boolean;
    messageId: string;
}>;
export declare const sendExaminerInterviewInvitationEmail: (examiners: Array<{
    email: string;
    name: string;
}>, interviewDate: string, interviewTime?: string, interviewVenue?: string) => Promise<PromiseSettledResult<{
    success: boolean;
    email: string;
    name: string;
    messageId: string;
    error?: never;
} | {
    success: boolean;
    email: string;
    name: string;
    error: unknown;
    messageId?: never;
}>[]>;
declare const _default: {
    sendMembershipInterviewUpdateEmail: (email: string, userName: string, membershipType: string, applicationStatus: string, interviewDate?: string, interviewTime?: string, interviewVenue?: string, adminNotes?: string) => Promise<{
        success: boolean;
        messageId: string;
    }>;
    sendReferenceRequestEmail: (referenceMemberEmail: string, referenceMemberName: string, applicantName: string, applicantEmail: string, membershipType: string, loginUrl?: string) => Promise<{
        success: boolean;
        messageId: string;
    }>;
    sendExaminerInterviewInvitationEmail: (examiners: Array<{
        email: string;
        name: string;
    }>, interviewDate: string, interviewTime?: string, interviewVenue?: string) => Promise<PromiseSettledResult<{
        success: boolean;
        email: string;
        name: string;
        messageId: string;
        error?: never;
    } | {
        success: boolean;
        email: string;
        name: string;
        error: unknown;
        messageId?: never;
    }>[]>;
};
export default _default;
//# sourceMappingURL=sendMembershipEmail.d.ts.map