import path from 'path';
import { out } from '@a2r/telemetry';
import { copyContents } from '@a2r/fs';

import {
  templatesPath,
  templatesFolders,
  mainTemplateFolder,
} from '../settings';
import { log } from './colors';
import getFrameworkPath from './getFrameworkPath';

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
  } else {
    out.error(`No template path found for project ${project}`);
  }
};

export default copyFilesFromTemplate;
