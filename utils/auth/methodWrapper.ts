/* eslint-disable @typescript-eslint/no-explicit-any */
import generateId from 'shortid';

import isClient from '../../tools/isClient';
import getSocket from './getSocket';
import roles from './roles';

import { SocketMessage, MethodCall } from '../../model/socket';

const methodWrapper = (method: string, ...args: any[]): Promise<any> => {
  if (!isClient()) {
    const [email, ...userRoles] = args;
    if (method === 'add') {
      return roles.addRolesToUser(email, ...userRoles);
    }
    if (method === 'remove') {
      return roles.removeRolesFromUser(email, ...userRoles);
    }
    if (method === 'check') {
      return roles.isUserInRole(email, ...userRoles);
    }
    throw new Error(`Unknown method: ${method}`);
  }
  return new Promise<any>((resolve, reject): void => {
    getSocket()
      .then((socket) => {
        if (socket) {
          if (socket.disconnected) {
            socket.connect();
          }
          const id = generateId();
          socket.on(id, (res: SocketMessage): void => {
            socket.off(id);
            if (res.o) {
              resolve(res.d);
            } else {
              const error = new Error(res.e);
              error.stack = res.s;
              reject(error);
            }
          });

          const call: MethodCall = {
            id,
            params: args,
          };

          socket.emit(method, call);
        } else {
          console.error('No client socket available!');
          reject(new Error('No client socket available!'));
        }
      })
      .catch((ex) => {
        reject(ex);
      });
  });
};

export default methodWrapper;
