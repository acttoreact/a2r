import { out } from '@a2r/telemetry';

import { getSettings } from './settings';
import getProjectPath from './getProjectPath';
import exec from '../tools/exec';
import { log, fullPath } from './colors';

/**
 * Temporary `dev` command that will run all needed dockers for solution
 */
const dev = async (): Promise<void> => {
  const settings = await getSettings();
  const mainProjectPath = await getProjectPath();
  log(`Running watchers and frameworks at ${fullPath(mainProjectPath)}`);
  log(`Stopping running dockers...`);
  const { watcher, devServer, projects } = settings;
  await exec('docker', ['stop', devServer.name]);
  await exec('docker', ['rm', devServer.name]);
  log(`Starting server...`);
  await exec(
    'docker',
    `run -it -d -v ${mainProjectPath}/server:/usr/src/app/server -p 4000:4000 --name ${devServer.name} ${devServer.imageName}:${devServer.version}`.split(
      ' ',
    ),
  );
  await Promise.all(
    projects.map(async (project) => {
      const { path: projectPath } = project;
      log(`Starting project ${projectPath}...`);
      const name = `${watcher.name}-${projectPath}`;
      await exec('docker', ['stop', name]);
      await exec('docker', ['rm', name]);
      const command = `run -it -d -v ${mainProjectPath}/server:/usr/src/app/server -v ${mainProjectPath}/${projectPath}/.a2r/proxy:/usr/src/app/.a2r/proxy --name ${name} ${watcher.imageName}:${watcher.version}`;
      out.info(command);
      await exec('docker', command.split(' '));
    }),
  );
  log(`All dockers and projects are running`);
};

export default dev;
