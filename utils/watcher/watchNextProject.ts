import path from 'path';

import { OnReady, WatcherOptions } from '../../model/watcher';

import {
  copyPathToDocker,
  removeFileFromDocker,
  removeFolderFromDocker,
} from '../docker';
import getProjectPath from '../getProjectPath';
import onError from './onError';
import watchFolder from './watchFolder';

import { log } from '../colors';

/**
 * Watch project folder for changes
 * @param projectPath Project path (as in project info)
 * @param dockerName Docker name (as in project info)
 * @param dockerRootPath Docker working dir
 * @param pathsToIgnore Paths to ignore (node_modules is always ignored)
 */
const watchNextProject = async (
  projectPath: string,
  dockerName: string,
  dockerRootPath: string,
  pathsToIgnore?: string[],
): Promise<void> => {
  const mainProjectPath = await getProjectPath();
  const currentProjectPath = path.resolve(mainProjectPath, projectPath);
  const onWatcherReady: OnReady = async (
    watcher,
    targetPath,
  ): Promise<void> => {
    log(`Watcher running for project: ${projectPath}`);
    watcher.on(
      'all',
      async (eventName, eventPath): Promise<void> => {
        const relativePath = path.relative(targetPath, eventPath);
        const dockerPath = path.resolve(dockerRootPath, relativePath);

        if (
          eventName === 'add' ||
          eventName === 'addDir' ||
          eventName === 'change'
        ) {
          copyPathToDocker(eventPath, dockerPath, dockerName);
        }

        if (eventName === 'unlink') {
          removeFileFromDocker(dockerPath, dockerName);
        }

        if (eventName === 'unlinkDir') {
          removeFolderFromDocker(dockerPath, dockerName);
        }
      },
    );
  };

  const allPathsToIgnore = [
    `${projectPath}/node_modules`,
    ...(pathsToIgnore || []).map((p) => `${projectPath}/${p}`),
  ];

  const watcherOptions: WatcherOptions = {
    onError,
    targetPath: currentProjectPath,
    onReady: onWatcherReady,
    options: {
      ignored: (eventPath: string): boolean => {
        const relative = path.relative(currentProjectPath, eventPath);
        return allPathsToIgnore.some((p) => relative.indexOf(p) !== -1);
      },
    },
  };

  await watchFolder(watcherOptions);
};

export default watchNextProject;
