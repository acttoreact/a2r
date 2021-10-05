/* eslint-disable @typescript-eslint/naming-convention */
import pullDockerImage from './pullDockerImage';
import getCleanProjectName from './getCleanProjectName';
import { setupSettings, defaultDevServer, defaultServer } from './settings';
import { log } from './colors';

import { SolutionInfo } from '../model';

import { dockerHubRepository } from '../settings';

const setup = async (projectPath: string, version: string): Promise<void> => {
  log(`Pulling docker images...`);
  const serverImage = `${dockerHubRepository}/server`;
  const serverDevImage = `${dockerHubRepository}/server-dev`;
  await pullDockerImage(serverImage);
  await pullDockerImage(serverDevImage);

  const projectName = await getCleanProjectName(projectPath);

  const settings: SolutionInfo = {
    projectName,
    version,
    productionDomain: '',
    projects: [],
    devServer: {
      ...defaultDevServer,
      version: 'latest',
      imageName: serverDevImage,
    },
    server: {
      ...defaultServer,
      version: 'latest',
      imageName: serverImage,
      url: 'your-project-domain.com',
    },
  };

  await setupSettings(projectPath, settings);
};

export default setup;
