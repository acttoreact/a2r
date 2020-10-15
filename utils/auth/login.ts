import { out } from '@a2r/telemetry';
import { compare } from 'bcryptjs';

import { getCollection } from '../dbPool';

import { LoginResponse, User } from '../../model';

/**
 * Log ins user
 * @param email User email
 * @param password User password
 */
const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    out.verbose(`Login user: ${email} / ${password}`);
    if (!email || !password) {
      out.error('Email and password are mandatory');
      return { ok: false, error: 'Email and password are mandatory' };
    }
    const collection = await getCollection<User>('users');
    const user = await collection.findOne({ _id: email }, { projection: { roles: 1 }});
    if (!user) {
      out.error(`There is no user with email ${email}`);
      return { ok: false, error: `There is no user with email ${email}` };
    }
    const check = await compare(password, user.password);
    if (!check) {
      out.error(`Password is incorrect`);
      return { ok: false, error: 'Password is incorrect' };
    }
    const { _id, roles } = user;
    return { ok: true, info: { _id, roles } };
  } catch (ex) {
    out.error(`Error at user login: ${ex.stack || ex.message}`, ex);
    return { ok: false, error: ex.stack || ex.message };
  }
};

export default login;
