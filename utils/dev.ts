import path from 'path';
import { out } from '@a2r/telemetry';
import { writeFile, ensureDir } from '@a2r/fs';

import { getSettings, getPackageJson } from './settings';
import getDockerCompose from './getDockerCompose';
import getProjectPath from './getProjectPath';
import exec from '../tools/exec';
import { log, terminalCommand } from './colors';

import { mongoUrlParam, mongoDbNameParam } from '../settings';
import cleanText from 'tools/cleanText';

// const workDir = '/usr/src/app';

/**
 * Temporary `dev` command that will run all needed dockers for solution
 */
const dev = async (): Promise<void> => {
  const settings = await getSettings();
  const { projects, devServer, watcher, db } = settings;
  if (projects.length) {
    const mainProjectPath = await getProjectPath();
    const a2rInternalPath = path.resolve(mainProjectPath, '.a2r');
    const packageJson = await getPackageJson(mainProjectPath);
    const { name: projectName } = packageJson;
    const cleanProjectName = cleanText(projectName, false, true, true, false, '', '-');
    const cookieKey = `${cleanProjectName}_sessionId`;
    const devServerInternalPath = path.resolve(a2rInternalPath, 'dev-server');
    const watcherInternalPath = path.resolve(a2rInternalPath, 'watcher');
    const dbDataInternalPath = path.resolve(a2rInternalPath, 'db', 'data');
    const devServerModules = path.resolve(
      devServerInternalPath,
      'node_modules',
    );
    await ensureDir(devServerInternalPath);
    await ensureDir(watcherInternalPath);
    await ensureDir(devServerModules);

    const devServerEnv = path.resolve(devServerInternalPath, '.env');
    const devServerParams = [`COOKIE_KEY=${cookieKey}`];
    if (db && db.url && db.name) {
      const { url, name } = db;
      devServerParams.push(`${mongoUrlParam}=${url}`);
      devServerParams.push(`${mongoDbNameParam}=${name}`);
    } else {
      await ensureDir(dbDataInternalPath);
      const dbName = db && db.name ? db.name : cleanProjectName;
      devServerParams.push(`${mongoUrlParam}=mongodb://${cleanProjectName}-db:27017`);
      devServerParams.push(`${mongoDbNameParam}=${dbName}`);
    }
    Object.entries(devServer.env || {}).forEach(([key, value]) => {
      devServerParams.push(`${key}=${value}`);
    });
    await writeFile(devServerEnv, devServerParams.join('\n'));

    const watcherEnv = path.resolve(watcherInternalPath, '.env');
    const watcherParams = [
      `PROXIES=${projects
        .map(({ path: projectPath }) => projectPath)
        .join(',')}`,
    ];
    Object.entries(watcher.env || {}).forEach(([key, value]) => {
      watcherParams.push(`${key}=${value}`);
    });
    await writeFile(watcherEnv, watcherParams.join('\n'));

    const dockerCompose = getDockerCompose(
      settings,
      cleanProjectName,
      mainProjectPath,
      devServerInternalPath,
      watcherInternalPath,
      dbDataInternalPath,
    );
    if (dockerCompose) {
      const dockerComposePath = path.resolve(
        mainProjectPath,
        '.a2r',
        'docker-compose.yml',
      );
      await writeFile(dockerComposePath, dockerCompose);
      const args = [
        '-f',
        dockerComposePath,
        'up',
        '--force-recreate',
      ];
      log(
        `Running docker-compose: ${terminalCommand(`docker-compose ${args.join(' ')}`)}`,
      );
      const res = await exec('docker-compose', args);
      log(`Command response\n${JSON.stringify(res)}`);
    } else {
      out.error(
        'Something went wrong, empty docker-compose has been generated',
      );
    }
  } else {
    out.warn(
      `You must add at least one project to solution before running ${terminalCommand(
        '--dev',
      )} command`,
    );
  }
};

export default dev;
