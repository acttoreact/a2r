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
 * Project info
 */
export interface ProjectInfo {
  version: string;
  type: 'next' | 'expo' | 'service';
  path: string;
  docker?: DockerInfo;
}

/**
 * Solution info
 */
export interface SolutionInfo {
  version: string;
  projects: ProjectInfo[];
  devServer: DockerInfo;
  server: DockerInfo;
  watcher: DockerInfo;
}

export interface PackageJson {
  name: string;
}
