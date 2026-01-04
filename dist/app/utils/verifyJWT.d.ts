import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLE, USER_STATUS } from '../modules/User/user.constant';
export declare const createToken: (jwtPayload: {
    _id?: string;
    name: string;
    email: string;
    mobileNumber?: string;
    profilePhoto?: string;
    emailVerified?: any;
    role: keyof typeof USER_ROLE;
    status: keyof typeof USER_STATUS;
    age?: number;
    cvUrl?: string;
    experienceCertificateUrl?: string;
    universityCertificateUrl?: string;
}, secret: string, expiresIn: any) => string;
export declare const verifyToken: (token: string, secret: string) => JwtPayload | Error;
//# sourceMappingURL=verifyJWT.d.ts.map