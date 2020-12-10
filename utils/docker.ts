import execa from 'execa';
import { out } from '@a2r/telemetry';

import exec from '../tools/exec';

/**
 * Copies path to docker (works with files and folders)
 * @param sourcePath Source path
 * @param destPath Destination path (in docker)
 * @param dockerName Docker name
 */
export const copyPathToDocker = async (
  sourcePath: string,
  destPath: string,
  dockerName: string,
): Promise<void> => {
  const dockerParams = ['cp', sourcePath, `${dockerName}:${destPath}`];
  await execa('docker', dockerParams);
};

/**
 * Removes a file from docker
 * @param filePath Path of file to remove
 * @param dockerName Docker name
 */
export const removeFileFromDocker = async (
  filePath: string,
  dockerName: string,
): Promise<void> => {
  const dockerParams = ['exec', dockerName, 'rm', filePath];
  await execa('docker', dockerParams);
};

/**
 * Removes a folder from docker
 * @param folderPath Path of folder to remove
 * @param dockerName Docker name
 */
export const removeFolderFromDocker = async (
  folderPath: string,
  dockerName: string,
): Promise<void> => {
  const dockerParams = ['exec', dockerName, 'rm', '-rf', folderPath];
  await execa('docker', dockerParams);
};

/**
 * Stops docker container
 * @param dockerName Docker name
 */
export const stop = async (dockerName: string): Promise<void> => {
  const dockerParams = ['stop', dockerName];
  try {
    await execa('docker', dockerParams);
  } catch (ex) {
    out.verbose(
      `Error stopping docker "${dockerName}", probably it wasn't running. Error: ${
        ex.stack || ex.message
      }`,
    );
  }
};

/**
 * Removes docker container
 * @param dockerName Docker name
 */
export const rm = async (dockerName: string): Promise<void> => {
  const dockerParams = ['rm', dockerName];
  try {
    await execa('docker', dockerParams);
  } catch (ex) {
    out.verbose(
      `Error removing docker "${dockerName}", probably it didn't exist. Error: ${
        ex.stack || ex.message
      }`,
    );
  }
};

/**
 * Touches file in docker
 * @param filePath File path in docker
 * @param dockerName Docker name
 */
export const touch = async (
  filePath: string,
  dockerName: string,
): Promise<void> => {
  const dockerParams = ['exec', dockerName, 'touch', filePath];
  await execa('docker', dockerParams);
};

/**
 * Checks if image with given name exists on machine
 * @param imageName Image name
 */
export const imageExists = async (imageName: string): Promise<boolean> => {
  const res = await exec('docker', ['images', '-q', imageName]);
  return !!res.stdout.trim();
};

/**
 * Checks is docker exists applying given filter
 * @param filter Filter (as in `docker ps --filter`)
 */
export const dockerExists = async (
  filter: string,
  checkStopped?: boolean,
): Promise<boolean> => {
  const psParams = ['ps', '-q', '--filter', filter];
  if (checkStopped) {
    psParams.push('-a');
  }
  const res = await exec('docker', psParams);
  return !!res.stdout.trim();
};

/**
 * Checks if docker with provided name is running
 * @param dockerName DOcker name
 * @param timeout Timeout (default: `5000`)
 */
export const isDockerRunning = async (
  dockerName: string,
  timeout = 5000,
): Promise<boolean> => {
  const isRunning = await dockerExists(`name=${dockerName}`);
  if (isRunning) {
    return true;
  }
  if (timeout) {
    await ((): Promise<void> =>
      new Promise((resolve) => setTimeout(resolve, 1000)))();
    return isDockerRunning(dockerName, Math.max(timeout - 1000, 0));
  }
  return false;
};

/**
 * Check for framework and uninstall if installed
 * @param dockerName Docker name (dev-server)
 */
export const checkForFrameworkOnServer = async (
  dockerName: string,
): Promise<void> => {
  const res = await exec('docker', [
    'exec',
    dockerName,
    'npm',
    'list',
    'a2r',
    '--depth=0',
    '--prefix',
    './server',
    '|',
    'grep',
    'a2r',
  ]);
  if (res.stdout.trim()) {
    await execa('docker', [
      'exec',
      'npm',
      'uninstall',
      'a2r',
      '--prefix',
      './server',
    ]);
  }
};
