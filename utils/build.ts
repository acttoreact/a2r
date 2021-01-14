import path from 'path';
import { out } from '@a2r/telemetry';
import { ensureDir, emptyFolder, copyContents } from '@a2r/fs';

import { Command, RunningCommand } from '../model';

import { getSettings, setFileName } from "./settings";
import { getSettings as getDevSettings } from './devSettings';
// eslint-disable-next-line import/no-cycle
import { printCommandUsage } from './help';
import getProjectPath from './getProjectPath';
import { build as buildApi } from './watcher/apiProxy';

import { serverPath, projectsInternalPath, apiPath, proxyPath, modelPath } from '../settings';

const build = async (info: RunningCommand): Promise<void> => {
  const { options } = info;
  if (!options.project) {
    out.error('Missing project folder to run');
    printCommandUsage('dev');
    return;
  }
  if (options.settings) {
    await setFileName(options.settings);
  }
  const { project: projectPath } = options;
  const settings = await getSettings();
  const project = settings.projects.find((p) => p.path === projectPath);
  if (!project) {
    out.error(`Project ${projectPath} not found in solution`);
    return;
  }
  const { productionDomain } = settings;
  if (!productionDomain) {
    out.error(`Can't build. Property "productionDomain" must be set in settings file`);
    return;
  }
  const devSettings = await getDevSettings();
  const mainProjectPath = await getProjectPath();
  const serverApiPath = path.resolve(mainProjectPath, serverPath, apiPath);
  const projectApiPath = path.resolve(mainProjectPath, projectPath, projectsInternalPath, proxyPath, apiPath);
  await ensureDir(projectApiPath);
  await emptyFolder(projectApiPath);
  await buildApi(serverApiPath, projectApiPath, devSettings, productionDomain);

  const serverModelPath = path.resolve(mainProjectPath, serverPath, modelPath);
  const projectModelPath = path.resolve(mainProjectPath, projectPath, projectsInternalPath, proxyPath, modelPath);
  await ensureDir(projectModelPath);
  await emptyFolder(projectModelPath);
  await copyContents(serverModelPath, projectModelPath);
};

const command: Command = {
  name: 'build',
  description: 'Prepares project for deploy',
  run: build,
  args: [
    {
      name: 'project',
      description: 'Project folder to run',
      type: String,
      typeLabel: '',
      required: true,
    }
  ],
};

export default command;
