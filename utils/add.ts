import path from 'path';
import { out } from '@a2r/telemetry';
import { readFile, writeFile } from '@a2r/fs'

import getProjectPath from './getProjectPath';
import copyFilesFromTemplate from './copyFilesFromTemplate';
import { log, terminalCommand, fullPath } from './colors';
import { addProject } from './settings';
import exec from '../tools/exec';

import { templatesFolders } from '../settings';

import { PackageJson, ProjectInfo, WithOptional } from '../model';

/**
 * Adds component project to solution
 * @param project Project type
 * @param destination Destination folder
 */
const add = async (project: 'next' | 'expo' | 'service', destination?: string): Promise<void> => {
  const templateFolder = templatesFolders[project];
  if (templateFolder) {
    if (!destination) {
      out.warn(`Destination folder has not been provided, using ${project}`);
    }
    const projectPath = await getProjectPath();
    const destFolder = destination || project;
    const destPath = path.resolve(projectPath, destFolder);
    log(`Adding ${project} project at ${fullPath(destPath)}...`);
    await copyFilesFromTemplate(project, destPath);
    const packageJsonPath = path.resolve(destPath, 'package.json');
    const packageJsonContent = await readFile(packageJsonPath, 'utf8');
    const packageJsonInfo = JSON.parse(packageJsonContent) as PackageJson;
    packageJsonInfo.name = destFolder;
    await writeFile(packageJsonPath, JSON.stringify(packageJsonInfo));
    log(`Running ${terminalCommand(`npm install`)}...`);
    await exec('npm', ['install'], { cwd: destPath });
    const projectInfo: WithOptional<ProjectInfo, 'port'> = {
      version: '1.0.0',
      type: project,
      path: destFolder,
    };
    await addProject(projectInfo);
    log(`Project created at ${fullPath(destPath)}`);
  } else {
    out.error(
      `Unknown option: ${project}. Available options are ${Object.keys(
        templatesFolders,
      )
        .map((s) => `'${s}'`)
        .join(', ')}`,
    );
  }
};

export default add;
