import { socketPath } from '../../settings';

const getSocketProvider = (
  serverSideUrl: string,
  clientSideUrl: string,
  build?: boolean,
): string => {
  const serverSocketUrl = `ws://${serverSideUrl}`;
  const clientSocketUrl = `ws://${clientSideUrl}`;

  return `import { io }  from "socket.io-client";
import { basePath, domain } from '../../../config/settings';

import isClient from './isClient';

/**
 * Socket basic call
 */
export interface SocketCall {
  /**
   * Unique ID for socket transmission
   * @type {string}
   * @memberof MethodCall
   */
  id: string;
}

/**
 * Socket method call
 */
export interface MethodCall extends SocketCall {
  /**
   * API Method name corresponding to complete key (like 'users.login')
   * @memberof MethodCall
   */
  method: string;
  /**
   * Params for API Method
   * @memberof MethodCall
   */
  params: any[];
};

/**
 * Socket standard response
 */
export interface SocketMessage {
  /**
   * Operation was ok (0) or not (1)
   * @memberof SocketMessage
   */
  o: number;
  /**
   * Operation error (if any)
   * @memberof SocketMessage
   */
  e?: string;
  /**
   * Operation stack (if error)
   * @memberof SocketMessage
   */
  s?: string;
  /**
   * Operation return data
   * @memberof SocketMessage
   */
  d: any;
};

const socket = io(${build ? `'wss://\${domain}'` : `isClient() ? '${clientSocketUrl}' : '${serverSocketUrl}'`}, {
  transports: ['websocket'],
  autoConnect: isClient(),
  path: '\${basePath}${socketPath}',
});

export default socket;`;
};

export default getSocketProvider;
