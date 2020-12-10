import path from 'path';
import { copyContents, emptyFolder } from '@a2r/fs';

import { OnValidation } from '../../model/watcher';

import { isJest } from '../../tools/isJest';
import { getSettings } from '../settings';
import { getSettings as getDevSettings } from '../devSettings';
import getProjectPath from '../getProjectPath';
import { removeFolderFromDocker, copyPathToDocker, touch, isDockerRunning } from '../docker';
import getFileToTouch from './getFileToTouch';

import {
  modelPath,
  serverPath,
  proxyPath,
  defaultDockerWorkDir,
  projectsInternalPath,
} from '../../settings';

/**
 * Method executed when API is validated after changes are processed
 */
const onModelValidation: OnValidation = async (
  serverModelPath, // ./server/model
  mainProxyPath, // ./.a2r/dev-server/proxy
): Promise<void> => {
  if (!isJest()) {
    const settings = await getSettings();
    const devSettings = await getDevSettings();
    const mainProjectPath = await getProjectPath();
    const mainModelPath = path.resolve(mainProxyPath, modelPath); // ./.a2r/dev-server/proxy/model
    await emptyFolder(mainModelPath);
    await copyContents(serverModelPath, mainModelPath);

    const serverDockerModelPath = path.resolve(
      defaultDockerWorkDir,
      serverPath,
      modelPath,
    );
    await removeFolderFromDocker(serverDockerModelPath, devSettings.server.dockerName);
    await copyPathToDocker(
      mainModelPath,
      serverDockerModelPath,
      devSettings.server.dockerName,
    );
    await touch(getFileToTouch('server'), devSettings.server.dockerName);

    await Promise.all(
      settings.projects.map(async (project) => {
        const projectModelPath = path.resolve(
          mainProjectPath,
          project.path,
          project.type === 'electron' ? 'renderer' : '',
          projectsInternalPath,
          proxyPath,
          modelPath,
        );
        await emptyFolder(projectModelPath);
        await copyContents(mainModelPath, projectModelPath);
      }),
    );

    await Promise.all(
      devSettings.activeProjects.map(async (project) => {
        if (project.type === 'next' && await isDockerRunning(project.dockerName)) {
          const dockerModelPath = path.resolve(
            defaultDockerWorkDir,
            projectsInternalPath,
            proxyPath,
            modelPath,
          );
          await removeFolderFromDocker(dockerModelPath, project.dockerName);
          await copyPathToDocker(
            mainModelPath,
            dockerModelPath,
            project.dockerName,
          );
          await touch(getFileToTouch(project.type), project.dockerName);
        }
      }),
    );

    // Copy to projects (both project folder and docker)
  }
};

export default onModelValidation;
