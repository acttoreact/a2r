import { getCollection } from '../dbPool';

import { User } from '../../model/auth';

/**
 * Adds roles to user
 * @param email User email
 * @param roles Roles to add
 */
const addRolesToUser = async (
  email: string,
  ...roles: string[]
): Promise<void> => {
  const collection = await getCollection<User>('users');
  await collection.updateOne(
    { _id: email },
    { $addToSet: { roles: { $each: roles } } },
  );
};

/**
 * Removes roles from user
 * @param email User email
 * @param roles Roles to remove
 */
const removeRolesFromUser = async (
  email: string,
  ...roles: string[]
): Promise<void> => {
  const collection = await getCollection<User>('users');
  await collection.updateOne(
    { _id: email },
    { $pull: { roles: { $in: roles } } },
  );
};

/**
 * Checks user is in any of the given roles
 * @param email User email
 * @param roles Roles to check
 */
const isUserInRole = async (email: string, ...roles: string[]) => {
  const collection = await getCollection<User>('users');
  const user = await collection.findOne(
    { _id: email, roles: { $in: roles } },
    { projection: { _id: 1 } },
  );
  return !!user;
};

export default {
  addRolesToUser,
  removeRolesFromUser,
  isUserInRole,
};
