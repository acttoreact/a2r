import { out } from '@a2r/telemetry';

import { getSettings, getPackageJson } from './settings';
import getProjectPath from './getProjectPath';
import exec from '../tools/exec';
import { log, fullPath, terminalCommand } from './colors';

import { mongoUrlParam, mongoDbNameParam } from '../settings';

const workDir = '/usr/src/app';

/**
 * Temporary `dev` command that will run all needed dockers for solution
 */
const dev = async (): Promise<void> => {
  const settings = await getSettings();
  const { watcher, devServer, projects, db } = settings;
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
    const serverParams = [`COOKIE_KEY=${cookieKey}`];
    if (db) {
      const { url, name } = db;
      serverParams.push(`${mongoUrlParam}=${url}`);
      serverParams.push(`${mongoDbNameParam}=${name}`);
    }
    const serverEnv = serverParams.map((p) => `--env ${p}`).join(' ');
    const serverVolumes = [
      `-v ${mainProjectPath}/server/api:${workDir}/server/api`,
      `-v ${mainProjectPath}/server/model:${workDir}/server/model`,
      `-v ${mainProjectPath}/server/package.json:${workDir}/server/package.json`,
    ];
    const devServerCommand = `run -it -d ${serverVolumes.join(
      ' ',
    )} -p 4000:4000 ${serverEnv} --name ${devServerName} ${devServerImage}`;
    log(`Starting server docker: docker ${devServerCommand}`);
    await exec('docker', devServerCommand.split(' '));
    log(`Server running as ${devServerName}`);

    const watcherName = `${watcher.name}-${packageJson.name}`;
    const watcherImage = `${watcher.imageName}:${watcher.version}`;
    const proxies = `--env PROXIES=${projects
      .map(({ path: projectPath }) => projectPath)
      .join(',')}`;
    const watcherVolumes = projects.map(
      ({ path: projectPath }) =>
        `-v ${mainProjectPath}/${projectPath}/.a2r/proxy:${workDir}/.a2r/${projectPath}`,
    );
    log(`Starting watcher using ${watcherImage}...`);
    const watcherCommand = `run -it -d ${proxies} -v ${mainProjectPath}/server:${workDir}/server ${watcherVolumes.join(
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
