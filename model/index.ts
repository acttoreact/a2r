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
  exitCode: number | null;
  /**
   * Command exit code
   * @type {number}
   * @memberof CommandResponse
   */
  closeCode: number | null;
  /**
   * Output from `stdout`
   * @type {string}
   * @memberof CommandResponse
   */
  stdout: string;
  /**
   * Error (if any)
   * @type {(Error | null)}
   * @memberof CommandResponse
   */
  error: Error | null;
  /**
   * Signal received on exit event (if any)
   * @type {(NodeJS.Signals | null)}
   * @memberof CommandResponse
   */
  exitSignal: NodeJS.Signals | null;
  /**
   * Signal received on close event (if any)
   * @type {(NodeJS.Signals | null)}
   * @memberof CommandResponse
   */
  closeSignal: NodeJS.Signals | null;
};

/**
 * Docker info relative to a project
 */
export interface DockerInfo {
  version: string;
  name: string;
  imageName: string;
  lastUpdate: Date;
  env?: {[key: string]: string | number};
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
  version?: string;
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
 * Service info for docker-compose
 */
export interface DockerComposeService {
  image: string;
  volumes?: string[];
  ports?: string[];
  tty?: boolean;
  restart?: 'no' | 'always' | 'on-failure' | 'unless-stopped';
}

/**
 * Services dictionary for docker-compose
 */
export interface DockerComposeServices {
  [key: string]: DockerComposeService;
}

/**
 * Volume options info for docker-compose
 */
export interface DockerComposeVolumeOptions {
  type: 'none';
  device: string;
  o: 'bind';
}

/**
 * Volume info for docker-compose
 */
export interface DockerComposeVolume {
  driver: 'local';
  // eslint-disable-next-line @typescript-eslint/naming-convention
  driver_opts: DockerComposeVolumeOptions;
}

/**
 * Volumes dictionary for docker-compose
 */
export interface DockerComposeVolumes {
  [key: string]: DockerComposeVolume;
}

/**
 * Info for docker-compose
 */
export interface DockerCompose {
  version: string;
  services: DockerComposeServices;
  volumes: DockerComposeVolumes;
}

/**
 * Type used to make one or multiple interface keys optional
 */
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export * from './auth';