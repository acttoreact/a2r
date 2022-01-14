import path from 'path';
import execa from 'execa';
import { out } from '@a2r/telemetry';
import { ensureDir } from '@a2r/fs';

import { Command, RunningCommand } from '../model';

import { getSettings, setFileName } from './settings';
import getProjectPath from './getProjectPath';
import getCleanProjectName from './getCleanProjectName';
import { log, terminalCommand } from './colors';
import createDevServerDocker from './createDevServerDocker';
import startWatchers from './watcher/start';
import onProcessExit from './onProcessExit';
import copyProjectContentsToDocker from './copyProjectContentsToDocker';
import { checkForFrameworkOnServer } from './docker';

import {
  devServerPath,
  serverPath,
  dockerServerPath,
  projectsInternalPath,
  cookieKeyKey,
  userTokenKeyKey,
} from '../settings';

/**
 * Temporary `dev` command that will run all needed dockers for solution
 */
const start = async (info: RunningCommand): Promise<void> => {
  const { options } = info;
  if (options.settings) {
    await setFileName(options.settings);
  }
  const settings = await getSettings();
  const { projects, devServer } = settings;
  if (projects.length) {
    const mainProjectPath = await getProjectPath();
    const mainServerPath = path.resolve(mainProjectPath, serverPath);
    const a2rInternalPath = path.resolve(mainProjectPath, projectsInternalPath);
    const cleanProjectName =
      settings.projectName || (await getCleanProjectName(mainProjectPath));
    const cookieKey = `${cleanProjectName}_sessionId`;
    const userTokenKey = `${cleanProjectName}_userToken`;

    const devServerInternalPath = path.resolve(a2rInternalPath, devServerPath);
    const devServerModules = path.resolve(
      devServerInternalPath,
      'node_modules',
    );
    const devServerEnv = path.resolve(devServerInternalPath, '.env');
    await ensureDir(devServerInternalPath);
    await ensureDir(devServerModules);

    const devSettings = await createDevServerDocker(
      settings,
      settings.devServer.name,
      devServerModules,
      devServerEnv,
      [
        [cookieKeyKey, cookieKey],
        [userTokenKeyKey, userTokenKey],
      ],
    );

    log(`Starting ${devSettings.server.dockerName} docker...`);
    await execa('docker', ['start', devSettings.server.dockerName]);
    await copyProjectContentsToDocker(
      mainServerPath,
      devSettings.server.dockerName,
      dockerServerPath,
    );
    await checkForFrameworkOnServer(devSettings.server.dockerName);

    const additionalFolders = new Set<string>(['utils', 'tools']);
    if (devServer.watchFolders?.length) {
      devServer.watchFolders.forEach((folder) => {
        additionalFolders.add(folder);
      });
    }

    await startWatchers(mainProjectPath, devServerInternalPath, Array.from(additionalFolders));

    const dockerExecParams = [
      'exec',
      '-t',
      devSettings.server.dockerName,
      'npm',
      'run',
      'dev',
    ];

    let killed = false;
    const subProcess = execa('docker', dockerExecParams, {
      stdout: process.stdout,
      stderr: process.stderr,
    });

    process.once('SIGINT', (): void => {
      killed = true;
      onProcessExit(devSettings.server.dockerName).then(() => {
        subProcess.kill();
        process.exit(0);
      });
    });

    try {
      await subProcess;
    } catch (ex) {
      if (!killed) {
        log(
          `Sub process error\n${(ex as Error).stack || (ex as Error).message}`,
        );
      }
    }
  } else {
    out.warn(
      `You must add at least one project to solution before running ${terminalCommand(
        '--dev',
      )} command`,
    );
  }
};

const command: Command = {
  name: 'start',
  description: 'Runs watcher and server',
  run: start,
  args: [],
};

export default command;
