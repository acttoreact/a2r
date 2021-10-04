import path from 'path';
import { copyContents, emptyFolder } from '@a2r/fs';

import { OnValidation } from '../../model/watcher';

import { build } from './apiProxy';
import { isJest } from '../../tools/isJest';
import { getSettings } from '../settings';
import { getSettings as getDevSettings } from '../devSettings';
import getProjectPath from '../getProjectPath';
import { removeFolderFromDocker, copyPathToDocker, touch } from '../docker';

import {
  apiPath,
  serverPath,
  proxyPath,
  defaultDockerWorkDir,
  projectsInternalPath,
} from '../../settings';

/**
 * Method executed when API is validated after changes are processed
 */
const onApiValidation: OnValidation = async (
  serverApiPath, // ./server/api
  mainProxyPath, // ./.a2r/dev-server/proxy
): Promise<void> => {
  if (!isJest()) {
    const settings = await getSettings();
    const devSettings = await getDevSettings();
    const mainProjectPath = await getProjectPath();

    const serverDockerApiPath = path.resolve(
      defaultDockerWorkDir,
      serverPath,
      apiPath,
    );
    await removeFolderFromDocker(
      serverDockerApiPath,
      devSettings.server.dockerName,
    );
    await copyPathToDocker(
      serverApiPath,
      serverDockerApiPath,
      devSettings.server.dockerName,
    );
    await touch(
      path.resolve(defaultDockerWorkDir, 'index.ts'),
      devSettings.server.dockerName,
    );

    const mainApiPath = path.resolve(mainProxyPath, apiPath); // ./.a2r/dev-server/proxy/api
    await emptyFolder(mainApiPath);
    await build(serverApiPath, mainApiPath);

    await Promise.all(
      settings.projects.map(async (project) => {
        const projectApiPath = path.resolve(
          mainProjectPath,
          project.path,
          project.type === 'electron' ? 'renderer' : '',
          projectsInternalPath,
          proxyPath,
          apiPath,
        );
        await emptyFolder(projectApiPath);
        await copyContents(mainApiPath, projectApiPath);
      }),
    );

    await Promise.all(
      devSettings.activeProjects.map(async (project) => {
        const dockerModelPath = path.resolve(
          defaultDockerWorkDir,
          projectsInternalPath,
          proxyPath,
          apiPath,
        );
        await removeFolderFromDocker(dockerModelPath, project.dockerName);
        await copyPathToDocker(
          mainApiPath,
          dockerModelPath,
          project.dockerName,
        );
      }),
    );
  }
};

export default onApiValidation;
