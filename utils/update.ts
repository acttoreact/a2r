import exec from '../tools/exec';
import getLatestVersion from './getLatestVersion';
import { log, version, framework } from './colors';

import { updateFrameworkVersion } from './settings';

import packageJSON from '../package.json';

const update = async (): Promise<void> => {
  const latestVersion = await getLatestVersion();
  const { version: currentVersion } = packageJSON;

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
    await exec('npm', ['install', `a2r@${latestVersion}`, '--save;']);
    updateFrameworkVersion(latestVersion);
    log(`>>> Project updated to ${version(latestVersion)}.`);
  }
};

export default update;
