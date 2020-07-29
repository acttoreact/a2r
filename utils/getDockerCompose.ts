import path from 'path';
import yaml from 'js-yaml';

import { SolutionInfo } from 'model';

const workDir = '/usr/src/app';

const getDockerCompose = (
  settings: SolutionInfo,
  projectName: string,
  mainProjectPath: string,
  devServerInternalPath: string,
  watcherInternalPath: string,
): string => {
  const { watcher, devServer, projects } = settings;
  if (projects.length) {
    const serverVolumeName = `${projectName}-server`;

    const devServerName = `${projectName}-${devServer.name}`;
    const devServerImage = `${devServer.imageName}:${devServer.version}`;
    const devServerModules = path.resolve(
      devServerInternalPath,
      'node_modules',
    );
    const devServerEnv = path.resolve(devServerInternalPath, '.env');
    const devServerVolumes = [
      `${serverVolumeName}:${workDir}/server`,
      `${devServerModules}:${workDir}/server/node_modules`,
      `${devServerEnv}:${workDir}/.env`,
    ];

    const watcherName = `${projectName}-${watcher.name}`;
    const watcherImage = `${watcher.imageName}:${watcher.version}`;
    const watcherEnv = path.resolve(watcherInternalPath, '.env');
    const watcherVolumes = [
      `${serverVolumeName}:${workDir}/server`,
      `${watcherEnv}:${workDir}/.env`,
      ...projects.map(
        ({ path: projectPath }) =>
          `${mainProjectPath}/${projectPath}/.a2r/proxy:${workDir}/.a2r/${projectPath}`,
      ),
    ];

    const services = {
      [devServerName]: {
        image: devServerImage,
        volumes: devServerVolumes,
        ports: ['4000:4000'],
        tty: true,
      },
      [watcherName]: {
        image: watcherImage,
        volumes: watcherVolumes,
        tty: true,
      },
    };

    const config = {
      version: '3.8',
      services,
      volumes: {
        [serverVolumeName]: {
          driver: 'local',
          driver_opts: {
            type: 'none',
            device: `${mainProjectPath}/server`,
            o: 'bind',
          },
        },
      },
    };
    return yaml.dump(config);
  }
  return '';
};

export default getDockerCompose;
