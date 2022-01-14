import path from 'path';
import { exists } from '@a2r/fs';

import { OnReady, WatcherOptions } from '../../model/watcher';

import { getSettings } from '../devSettings';
import { copyPathToDocker, removeFolderFromDocker, touch } from '../docker';
import onError from './onError';
import watchFolder from './watchFolder';

import { defaultDockerWorkDir, serverPath } from '../../settings';
import getFileToTouch from './getFileToTouch';

const watchFolders = async (folders: string[], mainServerPath: string): Promise<void> => {
  const devSettings = await getSettings();
  const {
    server: { dockerName },
  } = devSettings;
  const serverDockerServerPath = path.resolve(defaultDockerWorkDir, serverPath);
  await Promise.all(
    folders.map(async (folder): Promise<void> => {
      const sourcePath = path.resolve(mainServerPath, folder);
      const dockerPath = path.resolve(serverDockerServerPath, folder);
      if (await exists(sourcePath)) {
        const onReady: OnReady = async (watcher): Promise<void> => {
          watcher.on('all', async (): Promise<void> => {
            await removeFolderFromDocker(dockerPath, dockerName);
            await copyPathToDocker(sourcePath, dockerPath, dockerName);
            await touch(getFileToTouch('server'), devSettings.server.dockerName);
          });
        };
        const watcherOptions: WatcherOptions = {
          onError,
          onReady,
          targetPath: sourcePath,
        };
        await watchFolder(watcherOptions);
      }
    }),
  );
};

export default watchFolders;
