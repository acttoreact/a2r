import getDockerImageVersion from './getDockerImageVersion';
import pullDockerImage from './pullDockerImage';
import { setupSettings } from './settings';
import { log } from './colors';

import { SolutionInfo } from '../model';

import { dockerHubRepository } from '../settings';

const setup = async (projectPath: string, version: string): Promise<void> => {
  const watcherVersion = await getDockerImageVersion('watcher');
  const serverVersion = await getDockerImageVersion('server');
  const devServerVersion = await getDockerImageVersion('server-dev');

  log(`Pulling docker images...`);
  await pullDockerImage('watcher', watcherVersion);
  await pullDockerImage('server', serverVersion);
  await pullDockerImage('server-dev', devServerVersion);

  const now = new Date();

  const settings: SolutionInfo = {
    version,
    projects: [],
    devServer: {
      version: devServerVersion,
      lastUpdate: now,
      imageName: `${dockerHubRepository}/server-dev`,
      name: 'server-dev',
    },
    server: {
      version: serverVersion,
      lastUpdate: now,
      imageName: `${dockerHubRepository}/server`,
      name: 'server',
    },
    watcher: {
      version: watcherVersion,
      lastUpdate: now,
      imageName: `${dockerHubRepository}/watcher`,
      name: 'watcher',
    }
  };

  await setupSettings(projectPath, settings);
};

export default setup;
