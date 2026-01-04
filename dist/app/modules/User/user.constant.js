"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSearchableFields = exports.USER_STATUS = exports.USER_ROLE = void 0;
exports.USER_ROLE = {
    ADMIN: 'ADMIN',
    COMPANY: 'COMPANY',
    TEACHER: 'TEACHER',
    STUDENT: 'STUDENT',
    USER: 'USER',
    HR: 'HR',
    MARKETING_TEAM: 'MARKETING_TEAM',
    CUSTOMER_SERVICE_TEAM: 'CUSTOMER_SERVICE_TEAM',
};
exports.USER_STATUS = {
    ACTIVE: 'ACTIVE',
    BLOCKED: 'BLOCKED',
};
exports.UserSearchableFields = [
    'name',
    'email',
    'mobileNumber',
    'phone',
    'nid',
    'role',
    'status',
];
//# sourceMappingURL=user.constant.js.map