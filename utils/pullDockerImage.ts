import exec from '../tools/exec';

import { dockerHubRepository } from '../settings';

const pullDockerImage = async (
  image: string,
  version = 'latest',
  repository = dockerHubRepository,
): Promise<void> => {
  await exec('docker', ['pull', `${repository}/${image}:${version}`]);
};

export default pullDockerImage;
