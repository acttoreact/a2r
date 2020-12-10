import path from 'path';

import { defaultDockerWorkDir } from '../../settings';

/**
 * Gets file path to touch and trigger hot reload
 * @param projectType Project type
 */
const getFileToTouch = (projectType: string): string => {
  if (projectType === 'next') {
    return path.resolve(defaultDockerWorkDir, 'pages', 'index.tsx');
  }
  return path.resolve(defaultDockerWorkDir, 'index.ts');
};

export default getFileToTouch;
