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

/**
 * Looks for folder containing `package.json` file with framework installed as a dev-dependency
 * @param targetPath Target path
 */
const getProjectPath = async (
  targetPath = workingDirectory,
): Promise<string> => {
  if (projectPath) {
    return projectPath;
  }
  const a2rSettingsPath = path.resolve(targetPath, '.a2r', 'settings.json');
  const settingsExist = await exists(a2rSettingsPath);
  if (settingsExist) {
    projectPath = path.dirname(path.dirname(a2rSettingsPath));
    return projectPath;
  }
  const nextTarget = path.dirname(targetPath);
  if (nextTarget !== '/') {
    return getProjectPath(nextTarget);
  }
  return workingDirectory;
};

export default getProjectPath;
