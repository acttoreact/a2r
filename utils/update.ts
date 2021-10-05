import execa from 'execa';

import { Command, RunningCommand } from '../model';

import getLatestVersion from './getLatestVersion';
import { log, version, framework } from './colors';
import { getSettings, defaultDevServer, defaultServer, saveSettings } from './settings';
import getCleanProjectName from './getCleanProjectName';
import { imageExists, removeImage } from './docker';
import packageJSON from '../package.json';

import { defaultDockerImage, defaultDockerWorkDir } from '../settings';

const update = async (info: RunningCommand): Promise<void> => {
  const { options } = info;
  const latestVersion = await getLatestVersion();
  const { version: currentVersion } = packageJSON;

  if (!options.force && latestVersion === currentVersion) {
    log(
      `Your project is already using the latest version (${version(
        currentVersion,
      )}) of ${framework} 👌`,
    );
  } else {
    log(`>>> Updating project from ${version(currentVersion)} to ${version(latestVersion)}.`);
    await execa('npm', ['install', `a2r@${latestVersion}`, '--save'], {
      stdout: process.stdout,
      stderr: process.stderr,
    });
    log(`>>> Uninstalling from server, just in case (would cause problems)`);
    await execa('npm', ['uninstall', `a2r`, '--save', '--prefix', './server'], {
      stdout: process.stdout,
      stderr: process.stderr,
    });
    const settings = await getSettings();
    await Promise.all(
      settings.projects.map(async (p): Promise<void> => {
        log(`>>> Updating ${p.path}`);
        await execa(
          'npm',
          ['install', `a2r@${latestVersion}`, '--save-dev', '--prefix', `./${p.path}`],
          {
            stdout: process.stdout,
            stderr: process.stderr,
          },
        );
      }),
    );

    log('>>> Removing old docker images');
    const devServerImage = 'public.ecr.aws/r7l7n8i7/acttoreact/server-dev:latest';
    if (await imageExists(devServerImage)) {
      await removeImage(devServerImage);
    }
    const serverImage = 'public.ecr.aws/r7l7n8i7/acttoreact/server:latest';
    if (await imageExists(serverImage)) {
      await removeImage(serverImage);
    }

    settings.server = {
      ...defaultServer,
      ...settings.server,
      env: {
        ...defaultServer.env,
        ...(settings.server.env || {}),
      },
    };
    settings.devServer = {
      ...defaultDevServer,
      ...settings.devServer,
      env: {
        ...defaultDevServer.env,
        ...(settings.devServer.env || {}),
      },
    };
    const cleanProjectName = await getCleanProjectName();
    if (!settings.projectName) {
      settings.projectName = cleanProjectName;
    }
    settings.projects = settings.projects.map((p) => {
      if (p.type === 'next') {
        return {
          dockerBase: defaultDockerImage,
          dockerWorkingDir: defaultDockerWorkDir,
          dockerName: `${cleanProjectName}-${p.path}`,
          ...p,
        };
      }
      return p;
    });
    settings.version = latestVersion;
    await saveSettings(settings);
    log(`>>> Project updated to ${version(latestVersion)}.`);
  }
};

const command: Command = {
  run: update,
  name: 'update',
  description: `Updates the project to the last version of ${framework}`,
  args: [
    {
      name: 'force',
      description: 'Update without checking current version',
      type: Boolean,
      typeLabel: ' ',
    },
  ],
};

export default command;
