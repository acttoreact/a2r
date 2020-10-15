import { A2RUser, A2RUserTokenInfo } from 'a2r';

export interface User extends A2RUser {
  firstName?: string;
  lastName?: string;
}

export interface UserTokenInfo extends A2RUserTokenInfo {
  email: string;
}