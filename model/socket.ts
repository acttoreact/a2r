/**
 * Socket method call
 */
export interface MethodCall {
  /**
   * Unique ID for socket transmission
   * @type {string}
   * @memberof MethodCall
   */
  id: string;
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