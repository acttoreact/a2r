import path from 'path';
import { exists } from '@a2r/fs';

import { log, terminalCommand } from './colors';
import exec from '../tools/exec';

/**
 * Ensures a `package.json` file exists. If not, runs `npm init` with `--force` flag
 * @param {string} projectPath Project base path
 */
const ensureNpmInit = async (projectPath: string): Promise<void> => {
  const packageJsonPath = path.resolve(projectPath, 'package.json');
  const packageJsonExists = await exists(packageJsonPath);

  if (!packageJsonExists) {
    log(`Running ${terminalCommand('npm init')}...`);
    await exec('npm', ['init', '--force']);
  }
};

export default ensureNpmInit;
