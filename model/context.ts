import express, { Request } from 'express';
import http from 'http';
import io from 'socket.io';

import { A2RUserTokenInfo } from './auth';
import { A2RSocket } from './socket';

/**
 * Basic A2R Context (for `useContext` on API methods)
 */
export interface A2RContext {
  /**
   * User session ID
   */
  sessionId: string;
  /**
   * User info stored in user token (may be extended by user and returned in `user.login` API method)
   */
  userInfo?: A2RUserTokenInfo;
  /**
   * Client IPs (could be more than one if connecting through proxy and headers set in nginx)
   */
  ips: string[];
  /**
   * Referer URL for incoming connection
   */
  referer: string;
  /**
   * A2R Socket (undefined when in REST API)
   */
  socket?: A2RSocket;
  /**
   * Express.js Request (undefined when in socket)
   */
  req?: Request;
}

/**
 * Possible current context values
 */
export type CurrentContext = A2RContext | false | null;

/**
 * Server setup method context
 */
export interface ServerContext {
  /**
   * Express.js server ([docs](https://expressjs.com/es/api.html#express))
   */
  expressServer: express.Express;
  /**
   * Node.js HTTP server ([docs](https://nodejs.org/api/http.html#http_class_http_server))
   */
  httpServer: http.Server;
  /**
   * Socket server (socket.io) ([docs](https://socket.io/docs/server-api/))
   */
  ioServer: io.Server;
  /**
   * The port the server is listening to
   */
  port: number;
  /**
   * REST API prefix, should be used for any custom API endpoint
   */
  apiPrefix: string;
}