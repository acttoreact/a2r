/* eslint-disable @typescript-eslint/naming-convention */
import os from 'os';
import path from 'path';
import execa from 'execa';
import chalk from 'chalk';
import { ensureDir, readDir, writeFile } from '@a2r/fs';

import { ProjectInfo } from '../model';

import { getSettings as getDevSettings, addActiveProject } from './devSettings';
import getProjectPath from './getProjectPath';
import getCleanProjectName from './getCleanProjectName';
import onProcessExit from './onProcessExit';
import { imageExists, stop, rm } from './docker';
import { log } from './colors';
import copyProjectContentsToDocker from './copyProjectContentsToDocker';
import watchNextProject from './watcher/watchNextProject';

import {
  projectsInternalPath,
  defaultDockerWorkDir,
  defaultDockerImage,
} from '../settings';

const devNext = async (project: ProjectInfo): Promise<void> => {
  const devSettings = await getDevSettings();
  const mainProjectPath = await getProjectPath();
  const a2rInternalPath = path.resolve(mainProjectPath, projectsInternalPath);
  const cleanProjectName = await getCleanProjectName(mainProjectPath);
  const currentProjectPath = path.resolve(mainProjectPath, project.path);
  const projectInternalPath = path.resolve(
    mainProjectPath,
    a2rInternalPath,
    project.path,
  );
  const projectModulesPath = path.resolve(projectInternalPath, 'node_modules');
  const projectEnvPath = path.resolve(projectInternalPath, '.env');
  await ensureDir(projectInternalPath);
  await ensureDir(projectModulesPath);

  const dockerImage = project.dockerBase || defaultDockerImage;
  const projectDockerName =
    project.dockerName || `${cleanProjectName}-${project.path}`;
  const dockerWorkingDir = project.dockerWorkingDir || defaultDockerWorkDir;

  const checkImage = await imageExists(dockerImage);
  if (!checkImage) {
    log(`Pulling docker image ${dockerImage}...`);
    const pullParams = ['pull', dockerImage];
    await execa('docker', pullParams);
  } else {
    log(`Base image (${dockerImage}) already exists`);
  }

  await stop(projectDockerName);
  await rm(projectDockerName);

  const desiredPort = parseInt((project.env?.PORT || '') as string, 10);
  const { default: getPort } = await import('get-port');
  const currentPort = await getPort({ port: desiredPort || undefined });
  if (desiredPort && desiredPort !== currentPort) {
    log(
      `Port ${chalk.whiteBright(desiredPort)} is already in use, starting ${
        project.path
      } at port ${chalk.greenBright(currentPort)}`,
    );
  }

  const envVars = Object.entries(devSettings.keys).map(
    ([key, value]): string => `${key}=${value}`,
  );

  Object.entries(project.env || {}).forEach(([key, value]) => {
    if (key === 'PORT') {
      envVars.push(`PORT=${currentPort}`);
    } else {
      envVars.push(`${key}=${value}`);
    }
  });
  await writeFile(projectEnvPath, envVars.join('\n'));

  const networkParams = [];
  if (os.platform() !== 'darwin') {
    networkParams.push(...['--network', 'host']);
  } else {
    networkParams.push(...['-p', `${currentPort}:${currentPort}`]);
  }

  const dockerParams = [
    'create',
    '-it',
    '-w',
    dockerWorkingDir,
    '--env-file',
    projectEnvPath,
    '-v',
    `${projectModulesPath}:${dockerWorkingDir}/node_modules`,
    ...networkParams,
    '--name',
    projectDockerName,
    dockerImage,
  ];
  await execa('docker', dockerParams);

  await copyProjectContentsToDocker(
    currentProjectPath,
    projectDockerName,
    dockerWorkingDir,
  );

  log(`Starting ${projectDockerName} docker...`);
  await execa('docker', ['start', projectDockerName]);
  await watchNextProject(project.path, projectDockerName, dockerWorkingDir);

  const modulesInstalled = !!(await readDir(projectModulesPath)).length;
  if (!modulesInstalled) {
    log(`Modules not installed in docker, running npm install`);
    await execa('docker', ['exec', '-t', projectDockerName, 'npm', 'install'], {
      stdout: process.stdout,
      stderr: process.stderr,
    });
  }

  await addActiveProject({
    ...project,
    dockerBase: dockerImage,
    dockerName: projectDockerName,
    dockerWorkingDir,
  });

  const dockerExecParams = [
    'exec',
    '-t',
    projectDockerName,
    'npm',
    'run',
    'dev',
    '--',
    '--port',
    currentPort.toString(),
  ];

  let killed = false;
  const subProcess = execa('docker', dockerExecParams, {
    stdout: process.stdout,
    stderr: process.stderr,
  });

  process.once('SIGINT', (): void => {
    killed = true;
    onProcessExit(projectDockerName).then(() => {
      subProcess.kill();
      process.exit(0);
    });
  });

  try {
    await subProcess;
  } catch (ex) {
    if (!killed) {
      log(`Sub process error\n${(ex as Error).stack || (ex as Error).message}`);
    }
  }
};

export default devNext;
