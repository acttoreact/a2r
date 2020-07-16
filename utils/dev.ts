import path from 'path';
import { out } from '@a2r/telemetry';

import { getSettings } from './settings';
import getProjectPath from './getProjectPath';
import exec from '../tools/exec';
import { log, fullPath } from './colors';
import { ProjectInfo, DockerInfo } from '../model';

const runProjects = async (mainProjectPath: string, watcher: DockerInfo, projects: ProjectInfo[]): Promise<void> => {
  const pendingProjects = projects.slice();
  const project = pendingProjects.shift();
  if (project) {
    const { path: projectPath, type } = project;
    const command = `run -it -d -v ${mainProjectPath}/server:/usr/src/app/bin/server -v ${mainProjectPath}/${projectPath}/.a2r/proxy:/usr/src/app/bin/.a2r/proxy --name ${watcher.name} ${watcher.imageName}:${watcher.version}`;
    out.info(command);
    await exec('docker', command.split(' '));
    if (type === 'next') {
      await exec('npm', ['run', 'dev'], { cwd: path.resolve(mainProjectPath, projectPath) });
    }
  }
  if (pendingProjects.length) {
    await runProjects(mainProjectPath, watcher, pendingProjects);
  }
};

const dev = async (): Promise<void> => {
  const settings = await getSettings();
  const mainProjectPath = await getProjectPath();
  log(`Running watchers and frameworks at ${fullPath(mainProjectPath)}`);
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
  await exec('docker', [
    `run -it -d -v ${mainProjectPath}/server:/usr/src/app/server -p 4000:4000 --name ${devServer.name} ${devServer.imageName}:${devServer.version}`,
  ]);
  await runProjects(mainProjectPath, watcher, projects);
};

export default dev;
