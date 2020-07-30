import path from 'path';

import exec from '../tools/exec';
import getLatestVersion from './getLatestVersion';
import getProjectPath from './getProjectPath';
import { log, version, framework } from './colors';

import { updateFrameworkVersion } from './settings';

import packageJSON from '../package.json';

const update = async (): Promise<void> => {
  const latestVersion = await getLatestVersion();
  const { version: currentVersion } = packageJSON;

  await updateFrameworkVersion(latestVersion);

  if (latestVersion === currentVersion) {
    log(
      `Your project is already using the latest version (${version(
        currentVersion,
      )}) of ${framework} 👌`,
    );
  } else {
    log(
      `>>> Updating project from ${version(
        currentVersion,
      )} to ${version(latestVersion)}.`,
    );
    const projectPath = await getProjectPath();
    const a2rInternalPath = path.resolve(projectPath, '.a2r');
    await exec('docker-compose', ['down'], { cwd: a2rInternalPath });
    await exec('npm', ['install', `a2r@${latestVersion}`, '--save;']);
    log(`>>> Project updated to ${version(latestVersion)}.`);
  }
};

export default update;
