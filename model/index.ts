/**
 * Response from terminal after executing command
 */
export interface CommandResponse {
  /**
   * Executed command
   * @type {string}
   * @memberof CommandResponse
   */
  command: string;
  /**
   * Args passed to command
   * @type {string}
   * @memberof CommandResponse
   */
  args: string;
  /**
   * Command exit code
   * @type {number}
   * @memberof CommandResponse
   */
  code: number;
  /**
   * Output from `stdout`
   * @type {string}
   * @memberof CommandResponse
   */
  out: string;
  /**
   * Error (if any)
   * @type {(Error | null)}
   * @memberof CommandResponse
   */
  error: Error | null;
};

/**
 * Docker info relative to a project
 */
export interface DockerInfo {
  version: string;
  name: string;
  imageName: string;
  lastUpdate: Date;
}

/**
 * Server info
 */
export interface ServerInfo extends DockerInfo {
  url: string;
}

/**
 * Project info
 */
export interface ProjectInfo {
  version: string;
  type: 'next' | 'expo' | 'service';
  path: string;
  port: number;
  docker?: DockerInfo;
}

/**
 * Database info
 */
export interface DatabaseInfo {
  url: string;
  name: string;
}

/**
 * Solution info
 */
export interface SolutionInfo {
  version: string;
  projects: ProjectInfo[];
  devServer: ServerInfo;
  server: ServerInfo;
  watcher: DockerInfo;
  db?: DatabaseInfo;
}

/**
 * Basic interface for parsing `package.json`
 */
export interface PackageJson {
  name: string;
}

/**
 * Type used to make one or multiple interface keys optional
 */
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export * from './auth';