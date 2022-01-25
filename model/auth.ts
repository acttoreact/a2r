/**
 * User info
 */
export interface User {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _id: string;
  email: string;
  password: string;
  verified?: boolean;
  roles: string[];
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
 * Minimal user token info
 */
type UserTokenInfo = Pick<User, '_id'>;

/**
 * User info stored in token
 */
export type A2RUserTokenInfo = UserTokenInfo & Partial<Pick<User, 'roles'>>;

/**
 * Basic response
 */
export interface Response {
  ok: boolean;
  error?: string;
}

/**
 * Login response
 */
export interface LoginResponse extends Response {
  info?: A2RUserTokenInfo;
  userToken?: string;
}
