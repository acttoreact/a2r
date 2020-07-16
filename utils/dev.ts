import path from 'path';
import { out } from '@a2r/telemetry';

import { getSettings } from './settings';
import getProjectPath from './getProjectPath';
import exec from '../tools/exec';
import { log } from './colors';

const dev = async (): Promise<void> => {
  const settings = await getSettings();
  const mainProjectPath = await getProjectPath();
  log(`Stopping running dockers...`);
  const { watcher, devServer, projects } = settings;
  try {
    await exec('docker', ['stop', watcher.name]);
    await exec('docker', ['rm', watcher.name]);
    await exec('docker', ['stop', devServer.name]);
    await exec('docker', ['rm', devServer.name]);
  } catch (ex) {
    out.verbose(
      'Error while stopping dockers, probably there were no dockers running',
    );
  }
  log(`Starting dockers...`);
  const watchers = projects.map(
    ({ path: projectPath }) =>
      `run -it -d -v ${mainProjectPath}/server:/usr/src/app/bin/server -v ${mainProjectPath}/${projectPath}/.a2r/proxy:/usr/src/app/bin/.a2r/proxy --name ${watcher.name} ${watcher.imageName}:${watcher.version}`,
  );
  out.info(watchers.join('\n'));
  await Promise.all(
    watchers.map((watcherCommand) => exec('docker', [watcherCommand])),
  );
  await exec('docker', [
    `run -it -d -v ${mainProjectPath}/server:/usr/src/app/server -p 4000:4000 --name ${devServer.name} ${devServer.imageName}:${devServer.version}`,
  ]);
  await Promise.all(projects.map(({ type, path: projectPath }) => {
    if (type === 'next') {
      return exec('npm', ['run', 'dev'], { cwd: path.resolve(mainProjectPath, projectPath) });
    }
    return null;
  }));
};

export default dev;
