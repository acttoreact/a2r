import path from 'path';
import { out } from '@a2r/telemetry';

import { getSettings } from './settings';
import getProjectPath from './getProjectPath';
import exec from '../tools/exec';
import { log, fullPath } from './colors';
import { ProjectInfo, DockerInfo } from '../model';

const runProjects = async (
  mainProjectPath: string,
  watcher: DockerInfo,
  projects: ProjectInfo[],
): Promise<void> => {
  const pendingProjects = projects.slice();
  const project = pendingProjects.shift();
  if (project) {
    const { path: projectPath, type } = project;
    const name = `${watcher.name}-${projectPath}`;
    await exec('docker', ['stop', name]);
    await exec('docker', ['rm', name]);
    const command = `run -it -d -v ${mainProjectPath}/server:/usr/src/app/server -v ${mainProjectPath}/${projectPath}/.a2r/proxy:/usr/src/app/.a2r/proxy --name ${name} ${watcher.imageName}:${watcher.version}`;
    out.info(command);
    const commandRes = await exec('docker', command.split(' '));
    log(`Exit code: ${commandRes.code}. ${commandRes.out}`);
    if (type === 'next') {
      await exec('npm', ['run', 'dev'], {
        cwd: path.resolve(mainProjectPath, projectPath),
      });
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
  await exec('docker', ['stop', devServer.name]);
  await exec('docker', ['rm', devServer.name]);
  log(`Starting server...`);
  const serverResponse = await exec(
    'docker',
    `run -it -d -v ${mainProjectPath}/server:/usr/src/app/server -p 4000:4000 --name ${devServer.name} ${devServer.imageName}:${devServer.version}`.split(
      ' ',
    ),
  );
  log(`Exit code: ${serverResponse.code}. ${serverResponse.out}`);
  log(`Starting projects and watchers...`);
  await runProjects(mainProjectPath, watcher, projects);
};

export default dev;
