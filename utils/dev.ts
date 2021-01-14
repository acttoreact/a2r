import { out } from '@a2r/telemetry';

import { Command, RunningCommand } from '../model';

import { getSettings, setFileName } from "./settings";
import devNext from "./devNext";
import devElectron from './devElectron';
// eslint-disable-next-line import/no-cycle
import { printCommandUsage } from './help';

const dev = async (info: RunningCommand): Promise<void> => {
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
  if (project.type === 'next') {
    await devNext(project);
  }
  if (project.type === 'electron') {
    await devElectron(project);
  }
};

const command: Command = {
  name: 'dev',
  description: 'Runs the project inside given path in dev mode',
  run: dev,
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
