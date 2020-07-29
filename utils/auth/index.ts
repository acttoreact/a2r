import methodWrapper from './methodWrapper';
export { default as register } from './register';
export { default as login } from './login';
export { default as roles } from './roles';

export const addRolesToUser = (
  email: string,
  ...userRoles: string[]
): Promise<void> => methodWrapper('add', email, ...userRoles);

export const removeRolesFromUser = (
  email: string,
  ...userRoles: string[]
): Promise<void> => methodWrapper('remove', email, ...userRoles);

export const isUserInRole = (
  email: string,
  ...userRoles: string[]
): Promise<void> => methodWrapper('check', email, ...userRoles);
