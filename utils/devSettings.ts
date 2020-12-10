import path from 'path';
import { exists, readFile, writeFile } from '@a2r/fs';

import { DevSettings, RunningProjectInfo } from '../model';

import getProjectPath from './getProjectPath';
import { devServerPath, projectsInternalPath, dockerServerPath } from '../settings';

const settingsFileName = 'settings.json';

/**
 * Formats dev settings
 * @param settings Dev settings
 */
const formatSettings = (settings: DevSettings): string =>
  JSON.stringify(settings, null, 2);

const getSettingsPath = async (projectPath?: string): Promise<string> => {
  const mainProjectPath = projectPath || (await getProjectPath());
  return path.resolve(
    mainProjectPath,
    projectsInternalPath,
    devServerPath,
    settingsFileName,
  );
}

/**
 * Checks if dev settings exist
 */
export const settingsExist = async (projectPath?: string): Promise<boolean> => {
  const settingsPath = await getSettingsPath(projectPath);
  return exists(settingsPath);
};

/**
 * Gets dev settings
 * @param projectPath Main project path
 */
export const getSettings = async (
  projectPath?: string,
): Promise<DevSettings> => {
  const settingsPath = await getSettingsPath(projectPath);
  const fileContent = await readFile(settingsPath, 'utf8');
  return JSON.parse(fileContent) as DevSettings;
};

/**
 * Writes given info as dev settings
 * @param info Info to save
 * @param projectPath Main project path
 */
export const saveSettings = async (
  info: DevSettings,
  projectPath?: string,
): Promise<DevSettings> => {
  const settingsPath = await getSettingsPath(projectPath);
  await writeFile(settingsPath, formatSettings(info));
  return info;
};

/**
 * Inits dev settings
 * @param serverPort Port that server will be using
 * @param projectPath Main project path
 */
export const init = async (
  serverPort: number,
  serverDockerName: string,
  serverDockerImage: string,
  keys?: [string, string][],
  projectPath?: string,
): Promise<DevSettings> => {
  const check = await settingsExist(projectPath);
  if (check) {
    const settings = await getSettings(projectPath);
    settings.server = {
      port: serverPort,
      dockerName: serverDockerName,
      dockerImage: serverDockerImage,
      serverPath: dockerServerPath,
    };
    settings.keys = (keys || []).reduce((t, [key, value]) => ({
      ...t,
      [key]: value,
    }), {});
    settings.activeProjects = settings.activeProjects || [];
    return saveSettings(settings, projectPath);
  }
  const settings: DevSettings = {
    server: {
      port: serverPort,
      dockerName: serverDockerName,
      dockerImage: serverDockerImage,
      serverPath: dockerServerPath,
    },
    keys: (keys || []).reduce((t, [key, value]) => ({
      ...t,
      [key]: value,
    }), {}),
    activeProjects: [],
  };
  return saveSettings(settings, projectPath);
};

/**
 * Update several key-value pairs
 * @param keys Key-Value pairs
 */
export const setKeys = async (keys: [string, string][]): Promise<void> => {
  const settings = await getSettings();
  keys.forEach(([key, value]) => {
    settings.keys[key] = value;
  });
  await saveSettings(settings);
};

/**
 * Set key value
 * @param key Key name
 * @param value Key value
 */
export const setKey = async (key: string, value: string): Promise<void> => {
  const settings = await getSettings();
  settings.keys[key] = value;
  await saveSettings(settings);
};

/**
 * Gets keys dictionary
 */
export const getKeys = async (): Promise<{[key: string]: string}> => {
  const settings = await getSettings();
  return settings.keys;
};

/**
 * Gets key value
 * @param key Key name
 */
export const getKey = async (key: string): Promise<string | undefined> => {
  const settings = await getSettings();
  return settings.keys[key];
};

/**
 * Adds project to active project
 * @param project Project info
 */
export const addActiveProject = async (project: RunningProjectInfo): Promise<void> => {
  const settings = await getSettings();
  const activeProjects = settings.activeProjects.slice();
  const existing = activeProjects.findIndex(p => p.path === project.path);
  if (existing !== -1) {
    activeProjects.splice(existing, 1);
  }
  activeProjects.push(project);
  await saveSettings({
    ...settings,
    activeProjects,
  });
};