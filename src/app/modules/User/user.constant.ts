export const USER_ROLE = {
  ADMIN: 'ADMIN',
  COMPANY: 'COMPANY',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
  USER: 'USER',
  HR: 'HR',
  MARKETING_TEAM: 'MARKETING_TEAM',
  CUSTOMER_SERVICE_TEAM: 'CUSTOMER_SERVICE_TEAM',
} as const;

  export const USER_STATUS = {
    ACTIVE: 'ACTIVE',
    BLOCKED: 'BLOCKED',
  } as const;
  
  export const UserSearchableFields = [
    'name',
    'email',
    'mobileNumber',
    'phone',
    'nid',
    'role',
    'status',
  ];