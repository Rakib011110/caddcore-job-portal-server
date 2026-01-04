interface PaymentCustomer {
    name: string;
    email: string;
    phone: string;
    address: string;
}
interface PaymentInitiationData {
    amount: number;
    transactionId: string;
    successUrl: string;
    failUrl: string;
    cancelUrl: string;
    customer: PaymentCustomer;
    productInfo?: {
        name?: string;
        category?: string;
        profile?: string;
    };
}
interface PaymentValidationResponse {
    isValid: boolean;
    transactionId?: string;
    amount?: number;
    status?: string;
    cardType?: string;
    cardIssuer?: string;
    bankTransactionId?: string;
    storeAmount?: number;
    verifiedAt?: string;
    error?: string;
    data?: any;
}
export declare const initiateSSLCommerzPayment: (data: PaymentInitiationData) => Promise<{
    success: boolean;
    GatewayPageURL: any;
    transactionId: string;
    amount: number;
    sessionkey: any;
    data: any;
}>;
export declare const validateSSLCommerzPayment: (val_id: string, transactionId: string) => Promise<PaymentValidationResponse>;
export declare const getPaymentStatus: (transactionId: string) => Promise<{
    success: boolean;
    data: any;
    error?: never;
} | {
    success: boolean;
    error: string;
    data?: never;
}>;
export declare const refundPayment: (transactionId: string, amount: number, reason: string) => Promise<{
    success: boolean;
    message: string;
    error?: never;
} | {
    success: boolean;
    error: string;
    message?: never;
}>;
export declare const getPaymentConfig: () => {
    storeId: string;
    isLive: boolean;
    environment: string;
    successUrl: string;
    failUrl: string;
    cancelUrl: string;
    ipnUrl: string;
};
declare const _default: {
    initiateSSLCommerzPayment: (data: PaymentInitiationData) => Promise<{
        success: boolean;
        GatewayPageURL: any;
        transactionId: string;
        amount: number;
        sessionkey: any;
        data: any;
    }>;
    validateSSLCommerzPayment: (val_id: string, transactionId: string) => Promise<PaymentValidationResponse>;
    getPaymentStatus: (transactionId: string) => Promise<{
        success: boolean;
        data: any;
        error?: never;
    } | {
        success: boolean;
        error: string;
        data?: never;
    }>;
    refundPayment: (transactionId: string, amount: number, reason: string) => Promise<{
        success: boolean;
        message: string;
        error?: never;
    } | {
        success: boolean;
        error: string;
        message?: never;
    }>;
    getPaymentConfig: () => {
        storeId: string;
        isLive: boolean;
        environment: string;
        successUrl: string;
        failUrl: string;
        cancelUrl: string;
        ipnUrl: string;
    };
};
export default _default;
//# sourceMappingURL=sslcommerz.utils.d.ts.map