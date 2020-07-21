import { out } from '@a2r/telemetry';

import { getSettings, getPackageJson } from './settings';
import getProjectPath from './getProjectPath';
import exec from '../tools/exec';
import { log, fullPath, terminalCommand } from './colors';

/**
 * Temporary `dev` command that will run all needed dockers for solution
 */
const dev = async (): Promise<void> => {
  const settings = await getSettings();
  const { watcher, devServer, projects } = settings;
  if (projects.length) {
    const mainProjectPath = await getProjectPath();
    const packageJson = await getPackageJson(mainProjectPath);
    const cookieKey = `${packageJson.name}_sessionId`;
    log(`Running watchers and frameworks at ${fullPath(mainProjectPath)}`);
    log(`Stopping running dockers...`);

    const devServerName = `${devServer.name}-${packageJson.name}`;
    const devServerImage = `${devServer.imageName}:${devServer.version}`;
    log(`Starting server using ${devServerImage}...`);
    await exec('docker', ['stop', devServerName]);
    await exec('docker', ['rm', devServerName]);
    const devServerCommand = `run -it -d -v ${mainProjectPath}/server:/usr/src/app/server -p 4000:4000 --env COOKIE_KEY=${cookieKey} --name ${devServerName} ${devServerImage}`;
    log(`Starting server docker: docker ${devServerCommand}`);
    await exec('docker', devServerCommand.split(' '));
    log(`Server running as ${devServerName}`);

    const watcherName = `${watcher.name}-${packageJson.name}`;
    const watcherImage = `${watcher.imageName}:${watcher.version}`;
    const proxies = `--env PROXIES=${projects
      .map(({ path: projectPath }) => projectPath)
      .join(',')}`;
    const volumes = projects.map(
      ({ path: projectPath }) =>
        `-v ${mainProjectPath}/${projectPath}/.a2r/proxy:/usr/src/app/.a2r/${projectPath}`,
    );
    log(`Starting watcher using ${watcherImage}...`);
    const watcherCommand = `run -it -d ${proxies} -v ${mainProjectPath}/server:/usr/src/app/server ${volumes.join(
      ' ',
    )} --name ${watcherName} ${watcherImage}`;
    await exec('docker', ['stop', watcherName]);
    await exec('docker', ['rm', watcherName]);
    log(`Starting watcher docker: docker ${watcherCommand}`);
    await exec('docker', watcherCommand.split(' '));
    log(`Watcher running as ${watcherImage}...`);
    log(`All dockers and projects are running`);
  } else {
    out.warn(
      `You must add at least one project to solution before running ${terminalCommand(
        '--dev',
      )} command`,
    );
  }
};

export default dev;
