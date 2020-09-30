import path from 'path';
import { out } from '@a2r/telemetry';
import { copyContents, exists, rename } from '@a2r/fs';

import {
  templatesPath,
  templatesFolders,
  mainTemplateFolder,
} from '../settings';
import { log } from './colors';
import getFrameworkPath from './getFrameworkPath';

/**
 * Checks if destination path has `gitignore` file and renames it to right `.gitignore` name
 * @param destPath Destination path
 */
const checkAndRenameGitIgnore = async (destPath: string): Promise<void> => {
  const gitIgnorePath = path.resolve(destPath, 'gitignore');
  if (await exists(gitIgnorePath)) {
    const rightGitIgnorePath = path.resolve(destPath, '.gitignore');
    await rename(gitIgnorePath, rightGitIgnorePath);
  }
};

/**
 * Copies files from template to destination path
 * @param project Project type (next, expo, service)
 * @param destPath Destination path
 */
const copyFilesFromTemplate = async (
  project: string,
  destPath: string,
): Promise<void> => {
  log(`Copying files...`);
  const frameworkPath = await getFrameworkPath();
  const templateFolder =
    project === mainTemplateFolder
      ? mainTemplateFolder
      : templatesFolders[project];
  if (templateFolder) {
    const templatePath = path.resolve(
      frameworkPath,
      templatesPath,
      templateFolder,
    );
    await copyContents(templatePath, destPath);
    await checkAndRenameGitIgnore(destPath);
  } else {
    out.error(`No template path found for project ${project}`);
  }
};

export default copyFilesFromTemplate;
