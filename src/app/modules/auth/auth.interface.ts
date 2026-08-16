import { USER_ROLE } from '../User/user.constant';



export type TVerifyEmail = {
  token: string;
};

export type TLoginUser = {
  email: string;
  password: string;
};


export type TRegisterUser = {
  name: string;
  email: string;
  mobileNumber: string;
  nid?: string;
  password: string;
  role: keyof typeof USER_ROLE;
  address?: string;
  /**
   * Optional at the type level because whether it is actually required is a
   * runtime decision - see the `registration.student_id_required` setting.
   */
  studentId?: string;
};

export type TForgotPassword = {
  email: string;
};

export type TResetPassword = {
  token: string;
  newPassword: string;
};

export type TBulkRegisterUser = {
  users: TRegisterUser[];
};