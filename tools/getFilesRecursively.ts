import path from 'path';
import { readDir } from '@a2r/fs';

/**
 * Gets files recursively
 * @param folderPath Path to get files from
 * @param extName Extension names to filter files (including `.`)
 */
const getFilesRecursively = async (
  folderPath: string,
  pathsToIgnore?: string[],
  filesToIgnore?: string[],
): Promise<string[]> => {
  const contents = await readDir(folderPath, {
    encoding: 'utf8',
    withFileTypes: true,
  });
  const pathsToIgnoreSet = new Set(pathsToIgnore || []);
  const filesToIgnoreSet = new Set(filesToIgnore || []);
  const files = await Promise.all(
    contents.map(
      async (content): Promise<string[]> => {
        if (content.isDirectory()) {
          if (!pathsToIgnoreSet.has(content.name)) {
            const folderFiles = await getFilesRecursively(
              path.resolve(folderPath, content.name),
              pathsToIgnore,
              filesToIgnore,
            );
            return folderFiles;
          }
        } else if (!filesToIgnore || !filesToIgnore.length || !filesToIgnoreSet.has(content.name)) {
          return [path.resolve(folderPath, content.name)];
        }
        return [];
      },
    ),
  );
  return files.reduce((t, f) => [...t, ...f], []);
};

export default getFilesRecursively;