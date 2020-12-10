import path from 'path';
import { copyContents, copyFile, ensureDir, readDir } from '@a2r/fs';

/**
 * Copies project contents to docker avoiding `node_modules` folder
 * @param srcPath Source path
 * @param dockerName Docker name
 * @param dockerWorkingPath Docker working path
 */
const copyProjectContentsToPath = async (
  srcPath: string,
  destPath: string,
): Promise<void> => {
  const files = await readDir(srcPath, { withFileTypes: true });
  await Promise.all(
    files
      .filter((file) => file.name !== 'node_modules')
      .map(async (file) => {
        const fullSrcPath = path.resolve(srcPath, file.name);
        const fullDestPath = path.resolve(destPath, file.name);
        if (file.isDirectory()) {
          await ensureDir(fullDestPath);
          await copyContents(fullSrcPath, fullDestPath);
        } else {
          await copyFile(fullSrcPath, fullDestPath);
        }
      }),
  );
};

export default copyProjectContentsToPath;
