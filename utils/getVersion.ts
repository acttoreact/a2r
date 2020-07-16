import getLatestVersion from './getLatestVersion';
import { log, version, framework, terminalCommand } from './colors';

import packageJSON from '../package.json';

const getVersion = async (print = false): Promise<string> => {
  const lastVersion = await getLatestVersion();
  const { version: currentVersion } = packageJSON;

  if (print) {
    if (lastVersion === currentVersion) {
      log(
        `Your project is using the latest version (${version(
          currentVersion,
        )}) of ${framework} 👌`,
      );
    } else {
      log(
        `Your project is using version ${version(
          currentVersion,
        )} of ${framework}. Version ${version(
          lastVersion,
        )} is now available. Use ${terminalCommand(
          'npx a2r --update',
        )} to upgrade the project.`,
      );
    }
  }

  return currentVersion;
};

export default getVersion;
