import { socketPath } from '../../settings';

const getSocketProvider = (): string => `import { ManagerOptions, SocketOptions, io } from 'socket.io-client';
import { basePath, domain, useWebsocket } from '../../../config/settings';

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
}

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
}

const config: Partial<ManagerOptions & SocketOptions> = {
  autoConnect: true,
  path: \`\${basePath}${socketPath}\`,
};

if (isClient() && useWebsocket && window.location.host.includes('localhost')) {
  config.transports = ['websocket'];
}

const url =
  !domain && isClient() && !window.location.host.includes('localhost')
    ? window.location.host
    : domain;

const protocol = url && (url.includes('localhost') ? 'ws' : 'wss');

const socket = isClient() && url ? io(\`\${protocol}://\${url}\`, config) : undefined;

export default socket;
`;

export default getSocketProvider;
