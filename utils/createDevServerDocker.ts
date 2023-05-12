import execa from 'execa';
import chalk from 'chalk';
import getPort from 'get-port';
import { writeFile } from '@a2r/fs';

import { SolutionInfo, DevSettings } from '../model';

import { init } from './devSettings';
import { log } from './colors';
import { stop, rm } from './docker';

import { dockerServerPath, mongoUrlParam, mongoDbNameParam } from '../settings';

const createDevServerDocker = async (
  settings: SolutionInfo,
  devServerName: string,
  devServerModules: string,
  devServerEnv: string,
  keys?: [string, string][],
): Promise<DevSettings> => {
  const { devServer, db } = settings;

  const devServerImage = `${devServer.imageName}:${devServer.version}`;

  await stop(devServerName);
  await rm(devServerName);

  const desiredServerPort = parseInt((devServer.env?.PORT || '') as string, 10);
  const serverPort = await getPort({ port: desiredServerPort || undefined });
  if (desiredServerPort && desiredServerPort !== serverPort) {
    log(
      `Port ${chalk.whiteBright(
        desiredServerPort,
      )} is already in use, starting server at port ${chalk.greenBright(
        serverPort,
      )}`,
    );
  }

  const devSettings = await init(
    serverPort,
    devServerName,
    devServerImage,
    keys,
  );

  const devServerEnvVars = Object.entries(devSettings.keys).map(
    ([key, value]): string => `${key}=${value}`,
  );

  if (db && db.url && db.name) {
    const { url, name } = db;
    devServerEnvVars.push(`${mongoUrlParam}=${url}`);
    devServerEnvVars.push(`${mongoDbNameParam}=${name}`);
  } else {
    // await ensureDir(dbDataInternalPath);
    // const dbName = db && db.name ? db.name : cleanProjectName;
    // devServerEnvVars.push(`${mongoUrlParam}=mongodb://${cleanProjectName}-db:27017`);
    // devServerEnvVars.push(`${mongoDbNameParam}=${dbName}`);
  }

  Object.entries(devServer.env || {}).forEach(([key, value]) => {
    if (key === 'PORT') {
      devServerEnvVars.push(`PORT=${devSettings.server.port}`);
    } else {
      devServerEnvVars.push(`${key}=${value}`);
    }
  });
  await writeFile(devServerEnv, devServerEnvVars.join('\n'));

  const networkParams = ['-p', `${serverPort}:${serverPort}`];

  const dockerParams = [
    'create',
    '-it',
    '--env-file',
    devServerEnv,
    '-v',
    `${devServerModules}:${dockerServerPath}/node_modules`,
    ...networkParams,
    '--name',
    devServerName,
    devServerImage,
  ];

  await execa('docker', dockerParams);
  return devSettings;
};

export default createDevServerDocker;
