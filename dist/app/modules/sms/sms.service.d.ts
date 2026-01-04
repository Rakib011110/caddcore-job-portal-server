interface SMSResponse {
    success: boolean;
    code?: string;
    message?: string;
    data?: any;
}
export declare const SMSService: {
    sendSMS: (phoneNumber: string, message: string) => Promise<SMSResponse>;
    sendBulkSMS: (recipients: Array<{
        phoneNumber: string;
        message: string;
    }>) => Promise<SMSResponse[]>;
    checkBalance: () => Promise<any>;
    formatPhoneNumber: (phoneNumber: string) => string;
};
export default SMSService;
//# sourceMappingURL=sms.service.d.ts.map