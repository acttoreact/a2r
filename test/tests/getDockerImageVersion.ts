/**
 * @jest-environment node
 */

import getDockerImageVersion from '../../utils/getDockerImageVersion';

const regEx = /^version-\d+\.\d+\.\d+(-dev)?$/;

test('Get docker image version', async (): Promise<void> => {
  const version = await getDockerImageVersion('watcher');
  expect(version).toMatch(regEx);
});