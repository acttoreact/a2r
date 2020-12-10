/* eslint-disable @typescript-eslint/naming-convention */
import getDockerImageVersion from './getDockerImageVersion';
import pullDockerImage from './pullDockerImage';
import { setupSettings, defaultDevServer, defaultServer } from './settings';
import { log } from './colors';

import { SolutionInfo } from '../model';

import { dockerHubRepository } from '../settings';

const setup = async (projectPath: string, version: string): Promise<void> => {
  const serverVersion = await getDockerImageVersion('server');
  const devServerVersion = await getDockerImageVersion('server-dev');

  log(`Pulling docker images...`);
  await pullDockerImage('server', serverVersion);
  await pullDockerImage('server-dev', devServerVersion);

  const settings: SolutionInfo = {
    version,
    projects: [],
    devServer: {
      ...defaultDevServer,
      version: devServerVersion,
      imageName: `${dockerHubRepository}/server-dev`,
    },
    server: {
      ...defaultServer,
      version: serverVersion,
      imageName: `${dockerHubRepository}/server`,
      url: 'your-project-domain.com',
    },
  };

  await setupSettings(projectPath, settings);
};

export default setup;
