import path from 'path';
import yaml from 'js-yaml';

import { SolutionInfo, DockerCompose, DockerComposeServices, DockerComposeService } from 'model';

const workDir = '/usr/src/app';

const defaultServiceOptions: Omit<DockerComposeService, 'image'> = {
  tty: true,
  restart: 'unless-stopped',
};

const getDockerCompose = (
  settings: SolutionInfo,
  projectName: string,
  mainProjectPath: string,
  devServerInternalPath: string,
  watcherInternalPath: string,
  dbDataInternalPath: string,
): string => {
  const { watcher, devServer, projects, db } = settings;
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

    const services: DockerComposeServices = {
      [devServerName]: {
        ...defaultServiceOptions,
        image: devServerImage,
        volumes: devServerVolumes,
        ports: ['4000:4000'],
      },
      [watcherName]: {
        ...defaultServiceOptions,
        image: watcherImage,
        volumes: watcherVolumes,
      },
    };

    if (!db || !db.url) {
      const serviceName = `${projectName}-db`;
      services[serviceName] = {
        ...defaultServiceOptions,
        image: `mongo:${db && db.version ? db.version : 'latest'}`,
        volumes: [`${dbDataInternalPath}:/data/db`],
        ports: ['27017-27019'],
      }
    }

    for (let i = 0, l = projects.length; i < l; i++) {
      const { docker, port } = projects[i];
      if (docker) {
        const { name, imageName, version } = docker;
        const watcherName = `${projectName}-${name}`;
        services[watcherName] = {
          ...defaultServiceOptions,
          image: `${imageName}:${version}`,
          ports: [`${port}:3000`],
        };
      }
    }

    const config: DockerCompose = {
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
