import path from 'path';
import { out } from '@a2r/telemetry';

import { Command } from '../model';

import { log, framework, terminalCommand } from './colors';
import exec from '../tools/exec';
import checkDependencies from './checkDependencies';
import ensureNpmInit from './ensureNpmInit';
import copyFilesFromTemplate from './copyFilesFromTemplate';
import getLatestVersion from './getLatestVersion';
import setup from './setup';

import { mainTemplateFolder } from '../settings';

const init = async (): Promise<void> => {
  log(`>>> Initializing project with ${framework}`);
  const check = await checkDependencies();
  if (check) {
    const workingDirectory = process.cwd();
    await ensureNpmInit(workingDirectory);
    await copyFilesFromTemplate(mainTemplateFolder, workingDirectory);
    const latestVersion = await getLatestVersion();
    log(`Installing ${framework}...`);
    await exec('npm', ['install', `a2r@${latestVersion}`, '--save-dev']);
    log(`Running ${terminalCommand(`npm install`)}...`);
    await exec('npm', ['install'], {
      cwd: path.resolve(workingDirectory, 'server'),
    });
    await setup(workingDirectory, latestVersion);
    log(`<<< 👌 Project initialized successfully`);
  } else {
    out.error(`Some dependencies are missing`);
    log(`<<< 👎 Project can't be initialized`);
  }
};

const command: Command = {
  name: 'init',
  description: `Initializes the project for ${framework}`,
  run: init,
  args: [],
};

export default command;
