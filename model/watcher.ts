import ts from 'typescript';
import chokidar from 'chokidar';

/**
 * Process info resulting from watcher event
 */
export interface ProcessInfo {
  /**
   * Event type
   */
  type: 'add' |  'addDir' |  'change' |  'unlink' |  'unlinkDir';
  /**
   * Target path
   */
  targetPath: string;
}

/**
 * Watcher error handler
 */
export type OnError = (
  /**
   * Watcher error
   */
  error: Error,
  /**
   * Chokidar watcher instance
   */
  watcher?: chokidar.FSWatcher,
  /**
   * Target path used to initialize watcher
   */
  targetPath?: string,
) => void;

/**
 * Watcher ready event handler
 */
export type OnReady = (
  /**
   * Chokidar watcher instance
   */
  watcher: chokidar.FSWatcher,
  /**
   * Target path used to initialize watcher
   */
  targetPath: string,
) => void | Promise<void>;

/**
 * On Validation method
 */
export type OnValidation = (
  /**
   * Server path
   */
  serverPath: string,
  /**
   * Target path
   */
  targetPath: string,
) => Promise<void> | void;

/**
 * Watcher options
 */
export interface WatcherOptions {
  /**
   * Path that should be watched for changes
   * @memberof WatcherOptions
   */
  targetPath: string;
  /**
   * Errors handler
   * @memberof WatcherOptions
   */
  onError: OnError;
  /**
   * Method called once internal watcher (chokidar) is ready
   * @memberof WatcherOptions
   */
  onReady?: OnReady;
  /**
   * Internal watcher options:
   * WatchOptions from [chokidar](https://github.com/paulmillr/chokidar#api)
   * @memberof WatcherOptions
   */
  options?: chokidar.WatchOptions;
}

/**
 * For typescript nodes casting as docs container purposes
 */
export interface JSDocContainer {
  /**
   * Optional JSDoc array
   * @type {ts.JSDoc[]}
   * @memberof JSDocContainer
   */
  jsDoc?: ts.JSDoc[];
}