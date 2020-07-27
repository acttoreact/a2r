/**
 * User info
 */
export interface User {
  _id: string;
  email: string;
  password: string;
  verified?: boolean;
  roles: [string]
}

/**
 * Basic A2R user
 */
export type A2RUser = Omit<User, 'roles'>;

/**
 * New user
 */
export type NewA2RUser = Omit<A2RUser, '_id' | 'verified'>;

/**
 * User info stored in token
 */
export type UserTokenInfo = Pick<User, '_id' | 'roles'>;

/**
 * Basic response
 */
export interface Response {
  ok: boolean;
  error?: string;
}

export interface LoginResponse extends Response {
  token?: string;
}