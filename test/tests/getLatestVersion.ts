import path from 'path';
import { readFile } from '@a2r/fs';
import getLatestVersion from '../../utils/getLatestVersion';

test('Get framework latest version', async (): Promise<void> => {
  const packageJsonContent = await readFile(path.resolve(__dirname, '../../package.json'), 'utf8');
  const packageJson = JSON.parse(packageJsonContent);
  const latestVersion = await getLatestVersion();
  expect(latestVersion).toEqual(packageJson.version);
});