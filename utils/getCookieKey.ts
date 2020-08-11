import getProjectPath from './getProjectPath';
import { getPackageJson } from './settings';
import cleanText from '../tools/cleanText';

const getCookieKey = async (): Promise<string> => {
  const mainProjectPath = await getProjectPath();
  const packageJson = await getPackageJson(mainProjectPath);
  const { name: projectName } = packageJson;
  const cleanProjectName = cleanText(
    projectName,
    false,
    true,
    true,
    false,
    '',
    '-',
  );
  return `${cleanProjectName}_sessionId`;
};

export default getCookieKey;
