import express from 'express';
import http from 'http';
import io from 'socket.io';
import { A2RUserTokenInfo } from './auth';

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
}