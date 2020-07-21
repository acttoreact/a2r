import path from 'path';
import { writeFile, ensureDir, readFile } from '@a2r/fs';

import { log } from './colors';
import getProjectPath from './getProjectPath';

import { SolutionInfo, ProjectInfo, PackageJson, WithOptional } from '../model';

/**
 * Gets `package.json` content from main project path
 * @param projectPath Main project path
 */
export const getPackageJson = async (projectPath?: string): Promise<PackageJson> => {
  const mainProjectPath = projectPath || await getProjectPath();
  const packageJsonPath = path.resolve(mainProjectPath, 'package.json');
  const packageJsonContent = await readFile(packageJsonPath, 'utf8');
  return JSON.parse(packageJsonContent) as PackageJson;
}

/**
 * Gets project settings
 */
export const getSettings = async (): Promise<SolutionInfo> => {
  const mainProjectPath = await getProjectPath();
  const settingsPath = path.resolve(mainProjectPath, '.a2r', 'settings.json');
  const fileContent = await readFile(settingsPath, 'utf8');
  return JSON.parse(fileContent) as SolutionInfo;
};

/**
 * Writes given info as project settings
 * @param info Info to save
 * @param projectPath Main project path
 */
export const saveSettings = async (info: SolutionInfo, projectPath?: string): Promise<SolutionInfo> => {
  const mainProjectPath = projectPath || await getProjectPath();
  const settingsPath = path.resolve(mainProjectPath, '.a2r', 'settings.json');
  await writeFile(settingsPath, JSON.stringify(info, null, 2));
  return info;
};

/**
 * Adds component project to solution
 * @param info Project info
 */
export const addProject = async (info: WithOptional<ProjectInfo, 'port'>): Promise<SolutionInfo> => {
  const settings = await getSettings();
  const projectInfo: ProjectInfo = {
    ...info,
    port: Math.max(...settings.projects.map(({ port }) => port), 2999) + 1,
  }
  settings.projects.push(projectInfo);
  return saveSettings(settings);
};

/**
 * Updates framework version in settings
 * @param version Framework version
 */
export const updateFrameworkVersion = async (version: string): Promise<SolutionInfo> => {
  const settings = await getSettings();
  settings.version = version;
  return saveSettings(settings);
};

/**
 * Sets up initial project settings
 * @param projectPath Main project path
 * @param settings Initial settings
 */
export const setupSettings = async (projectPath: string, settings: SolutionInfo): Promise<void> => {
  log(`Initializing settings...`);
  const settingsPath = path.resolve(projectPath, '.a2r', 'settings.json');
  const containerPath = path.dirname(settingsPath);
  await ensureDir(containerPath);
  await saveSettings(settings, projectPath);
};

export default setupSettings;
