import path from 'path';
import { exists } from '@a2r/fs';

/**
 * Working directory
 */
const workingDirectory = process.cwd();

/**
 * Project path
 */
let projectPath = '';

const getProjectPath = async (targetPath: string = workingDirectory): Promise<string> => {
  if (projectPath) {
    return projectPath;
  }
  const packageJsonPath = path.join(targetPath, 'package.json');
  const packageExists = await exists(packageJsonPath);
  if (packageExists) {
    const packageInfo = await import(packageJsonPath);
    if (packageInfo.default.dependencies?.a2r) {
      projectPath = path.dirname(packageJsonPath);
    }
    return projectPath;
  }
  const nextTarget = path.dirname(targetPath);
  if (nextTarget !== '/') {
    return getProjectPath(nextTarget);
  }
  return workingDirectory;
};

export default getProjectPath;
