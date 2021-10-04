import { out } from '@a2r/telemetry';
import { hash } from 'bcryptjs';

import { getCollection } from '../dbPool';

import { NewA2RUser, A2RUser, Response } from '../../model';

/**
 * Registers user
 * @param user User info
 */
const register = async (user: NewA2RUser): Promise<Response> => {
  try {
    const { email, password: passwordInput, ...userInfo } = user;
    out.verbose(`Registering user: ${email}`, userInfo);
    if (!email || !passwordInput) {
      out.error('Email and password are mandatory');
      return { ok: false, error: 'Email and password are mandatory' };
    }
    const collection = await getCollection<A2RUser>('users');
    const userCheck = await collection.findOne(
      { _id: email },
      { projection: { email: 1 } },
    );
    if (userCheck) {
      out.error(`Email ${email} already exists`);
      return { ok: false, error: 'Email already exists' };
    }
    const password = await hash(passwordInput, 12);
    await collection.insertOne({
      email,
      password,
      _id: email,
      verified: false,
      ...userInfo,
    });
    return { ok: true };
  } catch (ex) {
    out.error(
      `Error at user register: ${(ex as Error).stack || (ex as Error).message}`,
    );
    return { ok: false, error: (ex as Error).stack || (ex as Error).message };
  }
};

export default register;
