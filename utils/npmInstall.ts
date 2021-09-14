import path from 'path';
import execa from 'execa';
import { out } from '@a2r/telemetry';

import { Command, RunningCommand } from '../model';

import getProjectPath from './getProjectPath';
import { getSettings } from './settings';
import { getSettings as getDevSettings, settingsExist } from './devSettings';
import { log, terminalCommand } from './colors';
import { copyPathToDocker, dockerExists } from './docker';

import { dockerServerPath, defaultDockerWorkDir } from '../settings';

const getCurrentProjectPath = async (): Promise<string> => {
  const workingDirectory = process.cwd();
  const mainPath = await getProjectPath();
  if (workingDirectory === mainPath) {
    log(
      `Command ${terminalCommand(
        'npm install',
      )} must be run inside the server folder or a project folder`,
    );
    return '';
  }
  const settings = await getSettings();
  const validPaths = new Set([
    path.resolve(mainPath, 'server'),
    ...settings.projects.map((p) => path.resolve(mainPath, p.path)),
  ]);
  if (validPaths.has(workingDirectory)) {
    return workingDirectory;
  }
  let validPath = '';
  let currentPath = path.dirname(workingDirectory);
  while (!validPath && currentPath !== mainPath) {
    if (validPaths.has(currentPath)) {
      validPath = currentPath;
    }
    currentPath = path.dirname(currentPath);
  }
  if (!validPath) {
    log(
      `Command ${terminalCommand(
        'npm install',
      )} must be run inside the server folder or a project folder`,
    );
  }
  return validPath;
};

const npmInstall = async (info: RunningCommand): Promise<void> => {
  const currentProjectPath = await getCurrentProjectPath();
  if (currentProjectPath) {
    const [install, ...packages] = info.argv;
    if (install === 'install') {
      const npmParams = ['install'];
      if (packages && packages.length) {
        npmParams.push(...packages);
      }
      const projectPath = path.basename(currentProjectPath);
      const target = projectPath === 'server' ? 'server' : 'project';
      log(`Installing on ${target} path...`);
      await execa('npm', npmParams, {
        stdout: process.stdout,
        stderr: process.stderr,
        cwd: currentProjectPath,
      });
      if (settingsExist()) {
        const devSettings = await getDevSettings();
        if (target === 'server') {
          const checkDocker = await dockerExists(
            `name=${devSettings.server.dockerName}`,
            true,
          );
          if (checkDocker) {
            await execa('docker', ['start', devSettings.server.dockerName]);
            if (!packages || !packages.length) {
              await copyPathToDocker(
                path.resolve(currentProjectPath, 'package.json'),
                path.resolve(dockerServerPath, 'package.json'),
                devSettings.server.dockerName,
              );
            }
            log('Running npm install on server docker...');
            await execa(
              'docker',
              [
                'exec',
                '-t',
                devSettings.server.dockerName,
                'npm',
                ...npmParams,
                '--prefix',
                './server',
              ],
              {
                stdout: process.stdout,
                stderr: process.stderr,
              },
            );
          } else {
            log(
              `Not installing in docker because server docker doesn't exist yet`,
            );
          }
        } else {
          const project = devSettings.activeProjects.find(
            (p) => p.path === projectPath,
          );
          if (project) {
            const { dockerName } = project;
            const checkDocker = await dockerExists(`name=${dockerName}`, true);
            if (checkDocker) {
              await execa('docker', ['start', dockerName]);
              if (!packages || !packages.length) {
                await copyPathToDocker(
                  path.resolve(currentProjectPath, 'package.json'),
                  path.resolve(defaultDockerWorkDir, 'package.json'),
                  dockerName,
                );
              }
              log('Running npm install on server docker...');
              await execa(
                'docker',
                ['exec', '-t', dockerName, 'npm', ...npmParams],
                {
                  stdout: process.stdout,
                  stderr: process.stderr,
                },
              );
            } else {
              log(
                `Not installing in docker because project docker doesn't exist yet`,
              );
            }
          } else {
            log(
              `Not installing in docker because project wasn't found in running projects`,
            );
          }
        }
      } else {
        log(`Not installing in docker because ${target} has never been started`);
      }
    } else {
      out.error(`Command ${terminalCommand(`npm ${install}`)} not supported`);
    }
  }
};

const command: Command = {
  name: 'npm',
  description: 'Install npm packages in working directory project and its docker (if at least created)',
  run: npmInstall,
  args: [],
}

export default command;
