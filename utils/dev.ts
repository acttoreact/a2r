import { out } from '@a2r/telemetry';

import { getSettings } from "./settings";
import devNext from "./devNext";
import devElectron from './devElectron';

const dev = async (projectPath: string): Promise<void> => {
  const settings = await getSettings();
  const project = settings.projects.find((p) => p.path === projectPath);
  if (project) {
    if (project.type === 'next') {
      await devNext(project);
    }
    if (project.type === 'electron') {
      await devElectron(project);
    }
  } else {
    out.error(`Project ${projectPath} not found in solution`);
  }
};

export default dev;
