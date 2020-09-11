import getProjectPath from './getProjectPath';
import { getPackageJson } from './settings';
import cleanText from '../tools/cleanText';

/**
 * Gets clean project name (slug style) for environment variables, cookies, etc
 * @param projectPath Main project (solution) path
 */
const getCleanProjectName = async (projectPath?: string): Promise<string> => {
  const mainProjectPath = projectPath || await getProjectPath();
  const packageJson = await getPackageJson(mainProjectPath);
  const { name: projectName } = packageJson;
  return cleanText(
    projectName,
    false,
    true,
    true,
    false,
    '',
    '-',
  );
};

export default getCleanProjectName;
