import { A2RUser } from 'a2r';

export interface User extends A2RUser {
  firstName?: string;
  lastName?: string;
}