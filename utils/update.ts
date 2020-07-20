import exec from '../tools/exec';
import getLatestVersion from './getLatestVersion';
import { log, version, framework } from './colors';

import { updateFrameworkVersion } from './settings';

import packageJSON from '../package.json';

const update = async (): Promise<void> => {
  const lastVersion = await getLatestVersion();
  const { version: currentVersion } = packageJSON;

  if (lastVersion === currentVersion) {
    log(
      `Your project is already using the latest version (${version(
        currentVersion,
      )}) of ${framework} 👌`,
    );
  } else {
    log(
      `>>> Updating project from ${version(
        currentVersion,
      )} to v${version(lastVersion)}.`,
    );
    log('... ⏰ this process might take some minutes 🤷‍ ...');
    await exec('npm', ['install', `a2r@${lastVersion}`, '--save;']);
    updateFrameworkVersion(lastVersion);
    log(`>>> Project updated to ${version(lastVersion)}.`);
  }
};

export default update;
