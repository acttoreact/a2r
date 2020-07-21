import path from 'path';
import { exists } from '@a2r/fs';

import getProjectPath from './getProjectPath';

let frameworkPath = '';

const getFrameworkPath = async (): Promise<string> => {
  if (!frameworkPath) {
    const projectPath = await getProjectPath();
    const modulePackageJson = path.join(projectPath, 'node_modules', 'a2r', 'package.json');
    const existsPackageJson = await exists(modulePackageJson);
    if (existsPackageJson) {
      frameworkPath = path.dirname(modulePackageJson);
    }
  }
  if (!frameworkPath) {
    const parts = __dirname.split(path.sep);
    for (let i = parts.length - 1; i >= 0 && !frameworkPath; i -= 1) {
      if (parts[i] === 'a2r') {
        frameworkPath = parts.slice(0, i + 1).join(path.sep);
      }
    }
  }
  return frameworkPath;
};

export default getFrameworkPath;
