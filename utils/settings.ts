/* eslint-disable @typescript-eslint/naming-convention */
import path from 'path';
import { writeFile, ensureDir, readFile, exists } from '@a2r/fs';
import { out } from '@a2r/telemetry';

import { SolutionInfo, PackageJson, ServerInfo } from '../model';

import { log, fileName as file } from './colors';
import getProjectPath from './getProjectPath';

let settingsFileName = 'settings.json';

/**
 * Sets settings file name
 * @param fileName File name
 */
export const setFileName = async (fileName: string): Promise<void> => {
  const mainProjectPath = await getProjectPath();
  const settingsPath = path.resolve(mainProjectPath, '.a2r', fileName);
  if (await exists(settingsPath)) {
    out.info(`Using settings file: ${file(fileName)}`);
    settingsFileName = fileName;
  } else {
    out.info(`Settings file ${file(fileName)} not found, using default ${file(settingsFileName)}`);
  }
};

/**
 * Default dev server info
 */
export const defaultDevServer: Required<Pick<ServerInfo, 'name' | 'env'>> = {
  name: 'server-dev',
  env: {
    PORT: 4000,
  },
};

/**
 * Default server info
 */
export const defaultServer: Required<Pick<ServerInfo, 'name' | 'env'>> = {
  name: 'server',
  env: {
    PORT: 80,
  },
};

/**
 * Gets `package.json` content from main project path
 * @param projectPath Main project path
 */
export const getPackageJson = async (
  projectPath?: string,
): Promise<PackageJson> => {
  const mainProjectPath = projectPath || (await getProjectPath());
  const packageJsonPath = path.resolve(mainProjectPath, 'package.json');
  const packageJsonContent = await readFile(packageJsonPath, 'utf8');
  return JSON.parse(packageJsonContent) as PackageJson;
};

/**
 * Gets project settings
 */
export const getSettings = async (): Promise<SolutionInfo> => {
  const mainProjectPath = await getProjectPath();
  const settingsPath = path.resolve(mainProjectPath, '.a2r', settingsFileName);
  const fileContent = await readFile(settingsPath, 'utf8');
  return JSON.parse(fileContent) as SolutionInfo;
};

/**
 * Writes given info as project settings
 * @param info Info to save
 * @param projectPath Main project path
 */
export const saveSettings = async (
  info: SolutionInfo,
  projectPath?: string,
): Promise<SolutionInfo> => {
  const mainProjectPath = projectPath || (await getProjectPath());
  const settingsPath = path.resolve(mainProjectPath, '.a2r', settingsFileName);
  await writeFile(settingsPath, JSON.stringify(info, null, 2));
  return info;
};

/**
 * Adds component project to solution
 * @param info Project info
 */
export const addProject = async (
  info: SolutionInfo['projects'][0],
): Promise<SolutionInfo> => {
  const settings = await getSettings();
  settings.projects.push(info);
  return saveSettings(settings);
};

/**
 * Sets up initial project settings
 * @param projectPath Main project path
 * @param settings Initial settings
 */
export const setupSettings = async (
  projectPath: string,
  settings: SolutionInfo,
): Promise<void> => {
  log(`Initializing settings...`);
  const settingsPath = path.resolve(projectPath, '.a2r', settingsFileName);
  const containerPath = path.dirname(settingsPath);
  await ensureDir(containerPath);
  await saveSettings(settings, projectPath);
};

export default setupSettings;
