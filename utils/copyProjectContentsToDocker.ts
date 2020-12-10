import path from 'path';
import { readDir } from '@a2r/fs';

import { copyPathToDocker } from './docker';

/**
 * Copies project contents to docker avoiding `node_modules` folder
 * @param srcPath Source path
 * @param dockerName Docker name
 * @param dockerWorkingPath Docker working path
 */
const copyProjectContentsToDocker = async (
  srcPath: string,
  dockerName: string,
  dockerWorkingPath: string,
): Promise<void> => {
  const files = await readDir(srcPath, { withFileTypes: true });
  await Promise.all(
    files
      .filter((file) => file.name !== 'node_modules')
      .map((file) =>
        copyPathToDocker(
          path.resolve(srcPath, file.name),
          path.resolve(dockerWorkingPath, file.name),
          dockerName,
        ),
      ),
  );
};

export default copyProjectContentsToDocker;
