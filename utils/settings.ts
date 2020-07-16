import path from 'path';
import merge from 'deepmerge';
import { writeFile, ensureDir, exists, readFile } from '@a2r/fs';

import { log } from './colors';
import getProjectPath from './getProjectPath';

import { SolutionInfo, ProjectInfo } from '../model';

export const getSettings = async (): Promise<SolutionInfo> => {
  const mainProjectPath = await getProjectPath();
  const settingsPath = path.resolve(mainProjectPath, '.a2r', 'settings.json');
  const fileContent = await readFile(settingsPath, 'utf8');
  return JSON.parse(fileContent) as SolutionInfo;
};

export const updateSettings = async (info: SolutionInfo, projectPath?: string): Promise<SolutionInfo> => {
  const mainProjectPath = projectPath || await getProjectPath();
  const settingsPath = path.resolve(mainProjectPath, '.a2r', 'settings.json');
  const fileExists = await exists(settingsPath);
  if (fileExists) {
    const fileContent = await readFile(settingsPath, 'utf8');
    const currentContent = JSON.parse(fileContent) as SolutionInfo;
    const finalInfo = merge<SolutionInfo>(currentContent, info);
    await writeFile(settingsPath, JSON.stringify(finalInfo, null, 2));
    return finalInfo;
  }
  await writeFile(settingsPath, JSON.stringify(info, null, 2));
  return info;
};

export const addProject = async (info: ProjectInfo): Promise<SolutionInfo> => {
  const settings = await getSettings();
  settings.projects.push(info);
  return updateSettings(settings);
};

export const setupSettings = async (projectPath: string, settings: SolutionInfo): Promise<void> => {
  log(`Initializing settings...`);
  const settingsPath = path.resolve(projectPath, '.a2r', 'settings.json');
  const containerPath = path.dirname(settingsPath);
  await ensureDir(containerPath);
  await updateSettings(settings, projectPath);
};

export default setupSettings;
